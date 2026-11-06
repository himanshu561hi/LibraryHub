import { User, RegistrationApplication } from '../models/index.js';
import { uploadToImageKit } from '../services/imagekit.service.js';
import { sendTransactionalEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Submit Public Self-Registration Application
 * POST /api/v1/public/register
 */
export async function submitRegistration(req, res, next) {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      fatherName,
      emergencyContact,
      targetExam,
      address,
      aadharFront,
      aadharBack,
    } = req.body;

    const studentName = (name || fullName || '').trim();

    // Field Validations
    if (!studentName) return errorResponse(res, 'Student full name is required', 400);
    if (!email?.trim() || !email.includes('@')) return errorResponse(res, 'Valid email address is required', 400);
    if (!phone?.trim()) return errorResponse(res, 'Mobile number is required', 400);
    if (!fatherName?.trim()) return errorResponse(res, "Father's name is required", 400);
    if (!emergencyContact?.trim()) return errorResponse(res, 'Emergency contact number is required', 400);
    if (!targetExam?.trim()) return errorResponse(res, 'Target exam or purpose is required', 400);
    if (!address?.trim()) return errorResponse(res, 'Residential address is required', 400);
    if (!aadharFront) return errorResponse(res, 'Aadhar card front photo is required', 400);
    if (!aadharBack) return errorResponse(res, 'Aadhar card back photo is required', 400);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if an existing enrolled student already uses this email
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser && existingUser.registrationStatus === 'APPROVED' && existingUser.isActive) {
      return errorResponse(
        res,
        'An active student account with this email or mobile number is already registered. Please proceed to Student Login.',
        409,
        'STUDENT_ALREADY_EXISTS'
      );
    }

    // Check if an application is already pending review
    const pendingApp = await RegistrationApplication.findOne({
      email: cleanEmail,
      status: 'PENDING',
    });

    if (pendingApp) {
      return errorResponse(
        res,
        `An application (Ref: ${pendingApp.applicationNumber}) has already been submitted for this email and is currently under review.`,
        409,
        'APPLICATION_ALREADY_PENDING'
      );
    }

    // Generate unique Application Reference Number: APP-YYYYMMDD-XXXX
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const applicationNumber = `APP-${yyyy}${mm}${dd}-${rand}`;

    logger.info(`Processing Aadhar uploads to ImageKit for registration: ${cleanEmail}`);

    // Upload Aadhar front & back photos to ImageKit
    const safeEmailPrefix = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();

    const [frontUpload, backUpload] = await Promise.all([
      uploadToImageKit(
        aadharFront,
        `aadhar_front_${safeEmailPrefix}_${timestamp}.jpg`,
        '/libraryhub/aadhar'
      ),
      uploadToImageKit(
        aadharBack,
        `aadhar_back_${safeEmailPrefix}_${timestamp}.jpg`,
        '/libraryhub/aadhar'
      ),
    ]);

    // Create the pending Registration Application
    const application = await RegistrationApplication.create({
      applicationNumber,
      name: studentName,
      email: cleanEmail,
      phone: cleanPhone,
      fatherName: fatherName.trim(),
      emergencyContact: emergencyContact.trim(),
      targetExam: targetExam.trim(),
      address: address.trim(),
      aadharFrontUrl: frontUpload.url,
      aadharFrontFileId: frontUpload.fileId,
      aadharBackUrl: backUpload.url,
      aadharBackFileId: backUpload.fileId,
      status: 'PENDING',
    });

    logger.info(`Registration application created: ${applicationNumber} for ${cleanEmail}`);

    // Optional confirmation email to student
    try {
      await sendTransactionalEmail({
        to: cleanEmail,
        subject: `Application Received: ${applicationNumber} - Library Hub Nawalpur`,
        text: `Hello ${studentName},\n\nWe have received your member registration application (${applicationNumber}) for Library Hub Nawalpur.\n\nYour application and Aadhar documents are currently under review by our administration. Once approved, you will receive another email and your student dashboard access will be activated.\n\nBest regards,\nLibrary Hub Nawalpur`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #0f172a; margin: 0;">Library Hub Nawalpur</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Self-Study & Reading Library</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <span style="display: inline-block; font-size: 12px; font-weight: bold; background-color: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; margin-bottom: 8px;">UNDER REVIEW</span>
              <h3 style="margin: 0; color: #0f172a; font-size: 16px;">Application Received Successfully</h3>
              <p style="font-size: 13px; color: #475569; margin: 6px 0 0 0;">Application Number: <strong>${applicationNumber}</strong></p>
            </div>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">Hello <strong>${studentName}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Thank you for applying to join Library Hub Nawalpur. We have securely received your admission details and Aadhar card verification documents.
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Our front desk and administration team is reviewing your application. You will receive an email confirmation as soon as your account is approved and activated.
            </p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
              Library Hub Nawalpur · Your Space. Your Focus. Your Success.
            </div>
          </div>
        `,
      });
    } catch (mailErr) {
      logger.warn(`Could not send application receipt email: ${mailErr.message}`);
    }

    return successResponse(
      res,
      {
        applicationNumber: application.applicationNumber,
        name: application.name,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt,
      },
      'Registration application submitted successfully and is under review.',
      201
    );
  } catch (err) {
    logger.error(`Error in submitRegistration: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Check Application Status by Email or Application Number
 * GET /api/v1/public/application-status/:query
 */
export async function getApplicationStatus(req, res, next) {
  try {
    const { query } = req.params;
    if (!query?.trim()) {
      return errorResponse(res, 'Email or application number is required', 400);
    }

    const clean = query.trim().toLowerCase();
    const application = await RegistrationApplication.findOne({
      $or: [{ applicationNumber: query.trim() }, { email: clean }],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!application) {
      return errorResponse(res, 'No registration application found with the provided details.', 404);
    }

    return successResponse(
      res,
      {
        applicationNumber: application.applicationNumber,
        name: application.name,
        email: application.email,
        status: application.status,
        rejectionReason: application.rejectionReason || null,
        createdAt: application.createdAt,
        reviewedAt: application.reviewedAt || null,
      },
      'Application status retrieved successfully'
    );
  } catch (err) {
    logger.error(`Error in getApplicationStatus: ${err.message}`, { error: err });
    return next(err);
  }
}

export default {
  submitRegistration,
  getApplicationStatus,
};
