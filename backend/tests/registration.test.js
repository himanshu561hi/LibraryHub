import request from 'supertest';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { RegistrationApplication, User, Admin, Membership, FeeInvoice, Payment } from '../src/models/index.js';
import { generateToken } from '../src/utils/token.js';
import { connectDatabase } from '../src/config/db.js';

describe('Online Self-Registration & Admin Approval Workflow', () => {
  let adminToken;
  let testAdmin;

  beforeAll(async () => {
    await connectDatabase();
    testAdmin = await Admin.findOne({ email: 'admin@libraryhub.in' });
    if (!testAdmin) {
      testAdmin = await Admin.create({
        name: 'Library Admin',
        email: 'admin@libraryhub.in',
        passwordHash: 'dummyhash',
        role: 'super_admin',
      });
    }
    adminToken = generateToken({
      id: testAdmin._id,
      email: testAdmin.email,
      role: testAdmin.role,
    });
  }, 25000);

  afterAll(async () => {
    // Cleanup any test applications and users
    await RegistrationApplication.deleteMany({ email: /testreg/i });
    await User.deleteMany({ email: /testreg/i });
    await Membership.deleteMany({ notes: /testreg/i });
  });

  describe('Public Self-Registration', () => {
    it('submits a new self-registration application with Aadhar photos', async () => {
      const res = await request(app)
        .post('/api/v1/public/register')
        .send({
          fullName: 'Test Applicant',
          email: 'testreg1@example.com',
          phone: '9876543210',
          fatherName: 'Test Father',
          emergencyContact: '9123456780',
          targetExam: 'BPSC',
          address: 'Main Road Nawalpur',
          photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          aadharFront: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          aadharBack: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('applicationNumber');
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.email).toBe('testreg1@example.com');
    });

    it('rejects registration with invalid email or phone', async () => {
      const res = await request(app)
        .post('/api/v1/public/register')
        .send({
          fullName: 'Bad Applicant',
          email: 'not-an-email',
          phone: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('retrieves application status using application number', async () => {
      const appDoc = await RegistrationApplication.findOne({ email: 'testreg1@example.com' });
      expect(appDoc).toBeTruthy();

      const res = await request(app)
        .get(`/api/v1/public/application-status/${appDoc.applicationNumber}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.applicationNumber).toBe(appDoc.applicationNumber);
      expect(res.body.data.status).toBe('PENDING');
    });
  });

  describe('Pending Security Gate (Block Student Login)', () => {
    it('blocks Google sign-in when student has a PENDING registration application', async () => {
      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({
          idToken: 'mock-token-testreg1@example.com',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REGISTRATION_PENDING');
      expect(res.body.error.message).toContain('under review by Library Hub');
    });
  });

  describe('Admin Applications Review & Approval Workflow', () => {
    let pendingApp;

    beforeEach(async () => {
      pendingApp = await RegistrationApplication.findOne({ email: 'testreg1@example.com' });
    });

    it('lists applications for admin with pending count', async () => {
      const res = await request(app)
        .get('/api/v1/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.applications)).toBe(true);
      expect(res.body.data.pendingCount).toBeGreaterThanOrEqual(1);
    });

    it('approves an application, creates student user, active membership, invoice and payment', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/applications/${pendingApp._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          joiningDate: '2026-11-01',
          slotType: 'day_shift',
          planName: 'Day Shift Plan (7 AM – 8 PM)',
          shiftTimings: '7:00 AM – 8:00 PM',
          monthlyFee: 500,
          initialPayment: 500,
          paymentMethod: 'CASH',
          notes: 'Test approval notes',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.status).toBe('APPROVED');
      expect(res.body.data.user.email).toBe('testreg1@example.com');
      expect(res.body.data.membership.status).toBe('active');

      // Verify user in database
      const createdUser = await User.findOne({ email: 'testreg1@example.com' });
      expect(createdUser).toBeTruthy();
      expect(createdUser.isMember).toBe(true);
      expect(createdUser.fatherName).toBe('Test Father');
      expect(createdUser.registrationStatus).toBe('APPROVED');
    });

    it('rejects an application with reason and sends notice', async () => {
      // Create a second application to reject
      const secondApp = await RegistrationApplication.create({
        applicationNumber: 'APP-TEST-REJECT-001',
        name: 'Reject Candidate',
        email: 'testreg2@example.com',
        phone: '9876543211',
        fatherName: 'Father Candidate',
        emergencyContact: '9876543219',
        targetExam: 'SSC CGL',
        address: 'Nawalpur Chowk',
        aadharFrontUrl: 'https://ik.imagekit.io/dummy-front.jpg',
        aadharBackUrl: 'https://ik.imagekit.io/dummy-back.jpg',
        status: 'PENDING',
      });

      const res = await request(app)
        .post(`/api/v1/admin/applications/${secondApp._id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Incomplete documents and shift capacity full',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application.status).toBe('REJECTED');
      expect(res.body.data.application.rejectionReason).toBe('Incomplete documents and shift capacity full');

      // Verify rejected student cannot login
      const loginRes = await request(app)
        .post('/api/v1/auth/google')
        .send({
          idToken: 'mock-token-testreg2@example.com',
        });

      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.code).toBe('REGISTRATION_REJECTED');
    });
  });
});
