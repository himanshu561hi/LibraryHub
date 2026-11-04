import mongoose from 'mongoose';
import { EmailCampaign, EmailRecipientLog, User, Membership, AuditLog } from '../models/index.js';
import { renderTemplate, sendTransactionalEmail } from '../services/emailService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Preview an email campaign template with variable interpolation
 */
export async function previewCampaignTemplate(req, res, next) {
  try {
    const { subject, htmlContent, sampleUserId } = req.body;

    let sampleUser = null;
    if (sampleUserId && mongoose.Types.ObjectId.isValid(sampleUserId)) {
      sampleUser = await User.findById(sampleUserId).lean();
    }
    if (!sampleUser) {
      sampleUser = {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        isMember: true,
      };
    }

    const membership = await Membership.findOne({ userId: sampleUser._id, status: 'active' }).lean();

    const variables = {
      name: sampleUser.name,
      email: sampleUser.email,
      membership_status: membership ? 'Active' : (sampleUser.isMember ? 'Active' : 'Inactive'),
      plan_name: membership ? membership.planName : 'N/A',
      library_name: 'Library Hub Nawalpur',
    };

    const renderedSubject = renderTemplate(subject || '', variables);
    const renderedHtml = renderTemplate(htmlContent || '', variables);

    return successResponse(res, {
      sampleUser,
      renderedSubject,
      renderedHtml,
    });
  } catch (err) {
    logger.error(`Error in previewCampaignTemplate: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get recipient list/count based on target audience filter
 */
export async function getAudienceRecipients(targetAudience, selectedUserIds = []) {
  let query = { role: 'student' };

  if (targetAudience === 'ACTIVE') {
    query.isMember = true;
  } else if (targetAudience === 'INACTIVE') {
    query.isMember = false;
  } else if (targetAudience === 'SELECTED' && selectedUserIds.length > 0) {
    query._id = { $in: selectedUserIds };
  } else if (targetAudience === 'INDIVIDUAL' && selectedUserIds.length > 0) {
    query._id = selectedUserIds[0];
  }

  return User.find(query).select('name email phone isMember').lean();
}

/**
 * Estimate audience count for compose modal
 */
export async function estimateAudience(req, res, next) {
  try {
    const { targetAudience = 'ALL', selectedUserIds = [] } = req.body;
    const recipients = await getAudienceRecipients(targetAudience, selectedUserIds);

    return successResponse(res, {
      targetAudience,
      recipientCount: recipients.length,
      sampleRecipients: recipients.slice(0, 5),
    });
  } catch (err) {
    logger.error(`Error in estimateAudience: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Create and dispatch a new email campaign (Admin only)
 */
export async function createAndSendCampaign(req, res, next) {
  try {
    const {
      subject,
      htmlContent,
      textContent,
      targetAudience = 'ALL',
      selectedUserIds = [],
    } = req.body;

    if (!subject || !subject.trim()) {
      return errorResponse(res, 'Email subject is required', 400);
    }
    if (!htmlContent || !htmlContent.trim()) {
      return errorResponse(res, 'Email content (HTML) is required', 400);
    }

    const recipients = await getAudienceRecipients(targetAudience, selectedUserIds);
    if (recipients.length === 0) {
      return errorResponse(res, 'No recipient students match the selected target audience', 400);
    }

    const campaign = await EmailCampaign.create({
      subject: subject.trim(),
      htmlContent,
      textContent: textContent || '',
      targetAudience,
      selectedUserIds: targetAudience === 'SELECTED' ? selectedUserIds : [],
      recipientCount: recipients.length,
      status: 'SENDING',
      createdByAdminId: req.user._id,
      stats: { sent: 0, failed: 0, delivered: 0, skippedUnsubscribed: 0 },
    });

    await AuditLog.create({
      actor: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      action: 'EMAIL_CAMPAIGN_CREATE',
      targetEntity: 'EmailCampaign',
      targetId: campaign._id,
      beforeState: null,
      afterState: {
        campaignId: campaign._id,
        subject: campaign.subject,
        targetAudience: campaign.targetAudience,
        recipientCount: recipients.length,
      },
      reason: `Dispatched campaign "${campaign.subject}" to ${recipients.length} recipients`,
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const vars = {
        name: recipient.name,
        email: recipient.email,
        membership_status: recipient.isMember ? 'Active' : 'Inactive',
        library_name: 'Library Hub Nawalpur',
      };

      const personalizedSubject = renderTemplate(subject, vars);
      const personalizedHtml = renderTemplate(htmlContent, vars);

      try {
        const result = await sendTransactionalEmail({
          to: recipient.email,
          subject: personalizedSubject,
          html: personalizedHtml,
          text: textContent ? renderTemplate(textContent, vars) : undefined,
        });

        await EmailRecipientLog.create({
          campaignId: campaign._id,
          userId: recipient._id,
          email: recipient.email,
          recipientName: recipient.name,
          status: result.success ? 'SENT' : 'FAILED',
          error: result.error || null,
          sentAt: result.success ? new Date() : null,
        });

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (sendErr) {
        failedCount++;
        await EmailRecipientLog.create({
          campaignId: campaign._id,
          userId: recipient._id,
          email: recipient.email,
          recipientName: recipient.name,
          status: 'FAILED',
          error: sendErr.message,
        });
      }
    }

    campaign.stats.sent = sentCount;
    campaign.stats.failed = failedCount;
    campaign.status = failedCount === 0 ? 'COMPLETED' : (sentCount > 0 ? 'COMPLETED' : 'FAILED');
    campaign.sentAt = new Date();
    await campaign.save();

    logger.info(`Campaign ${campaign._id} completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return successResponse(
      res,
      {
        campaign,
        sentCount,
        failedCount,
      },
      `Campaign dispatched to ${recipients.length} recipients (${sentCount} sent successfully)`,
      201
    );
  } catch (err) {
    logger.error(`Error in createAndSendCampaign: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * List past campaigns with statistics
 */
export async function listCampaigns(req, res, next) {
  try {
    if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
      return successResponse(res, {
        campaigns: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });
    }

    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      EmailCampaign.find()
        .populate('createdByAdminId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      EmailCampaign.countDocuments(),
    ]);

    return successResponse(res, {
      campaigns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error(`Error in listCampaigns: ${err.message}`, { error: err });
    return next(err);
  }
}

/**
 * Get campaign details and recipient delivery logs
 */
export async function getCampaignById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Invalid campaign ID', 400);
    }

    const campaign = await EmailCampaign.findById(id).populate('createdByAdminId', 'name email role').lean();
    if (!campaign) {
      return errorResponse(res, 'Campaign not found', 404);
    }

    const recipientLogs = await EmailRecipientLog.find({ campaignId: id })
      .populate('userId', 'name email phone picture')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, {
      campaign,
      recipientLogs,
    });
  } catch (err) {
    logger.error(`Error in getCampaignById: ${err.message}`, { error: err });
    return next(err);
  }
}

export default {
  previewCampaignTemplate,
  estimateAudience,
  createAndSendCampaign,
  listCampaigns,
  getCampaignById,
};
