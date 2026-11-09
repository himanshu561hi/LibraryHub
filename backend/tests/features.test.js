import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { User, Admin, Membership, EmailDeliveryLog, FeeInvoice, Payment } from '../src/models/index.js';
import { generateToken } from '../src/utils/token.js';
import { calculateNextBillingDate, calculateDueDate, generateInvoiceNumber, generateReceiptNumber } from '../src/utils/billingCalculator.js';
import { escapeCsvCell } from '../src/controllers/admin.controller.js';
import { connectDatabase } from '../src/config/db.js';

describe('Phase 05 - Phase 09 Features and Business Rules', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 25000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Billing & Calendar Engine Tests', () => {
    test('calculateNextBillingDate clamps for month-end dates (e.g. Jan 31 -> Feb 28/29)', () => {
      const jan31 = new Date(Date.UTC(2025, 0, 31)); // Jan 31, 2025
      const febNext = calculateNextBillingDate(jan31, 31);
      expect(febNext.getUTCFullYear()).toBe(2025);
      expect(febNext.getUTCMonth()).toBe(1); // Feb
      expect(febNext.getUTCDate()).toBe(28); // 2025 is not leap year
    });

    test('calculateNextBillingDate preserves 15th anchor across all months', () => {
      const jan15 = new Date(Date.UTC(2025, 0, 15));
      const feb15 = calculateNextBillingDate(jan15, 15);
      expect(feb15.getUTCDate()).toBe(15);
      expect(feb15.getUTCMonth()).toBe(1);
    });

    test('calculateDueDate correctly adds grace period days', () => {
      const issueDate = new Date(Date.UTC(2025, 0, 10));
      const dueDate = calculateDueDate(issueDate, 7);
      expect(dueDate.getUTCDate()).toBe(17);
    });

    test('generateInvoiceNumber and generateReceiptNumber output valid formatted prefixes', () => {
      const inv = generateInvoiceNumber('INV', new Date(Date.UTC(2025, 5, 15)));
      expect(inv).toMatch(/^INV-20250615-\d{4}$/);

      const rcp = generateReceiptNumber('RCP', new Date(Date.UTC(2025, 5, 15)));
      expect(rcp).toMatch(/^RCP-20250615-\d{4}$/);
    });
  });

  describe('Security: CSV Formula Injection Protection', () => {
    test('escapes formulas starting with =, +, -, @', () => {
      expect(escapeCsvCell('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
      expect(escapeCsvCell('+cmd|')).toBe('"\' +cmd|"'.replace(' ', ''));
      expect(escapeCsvCell('-calc')).toBe('"\' -calc"'.replace(' ', ''));
      expect(escapeCsvCell('@SUM')).toBe('"\'@SUM"');
    });

    test('regular values are properly quoted without leading single quote', () => {
      expect(escapeCsvCell('Rahul Sharma')).toBe('"Rahul Sharma"');
      expect(escapeCsvCell('60000')).toBe('"60000"');
      expect(escapeCsvCell(null)).toBe('""');
    });
  });

  describe('Access Control on Business Endpoints', () => {
    test('rejects unauthenticated requests to /api/v1/memberships', async () => {
      const res = await request(app).get('/api/v1/memberships');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('rejects student role accessing admin membership creation', async () => {
      const mockUserId = '507f191e810c19729de860ea';
      const studentToken = generateToken({
        id: mockUserId,
        email: 'student@example.com',
        role: 'student',
      });

      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: mockUserId,
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
        isMember: false,
      });

      const res = await request(app)
        .post('/api/v1/memberships')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          email: 'another@example.com',
          monthlyFeeInPaise: 60000,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('rejects attendance check-in when user is not an active member', async () => {
      const mockUserId = '507f191e810c19729de860ea';
      const nonMemberToken = generateToken({
        id: mockUserId,
        email: 'inactive@example.com',
        role: 'student',
      });

      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: mockUserId,
        name: 'Inactive User',
        email: 'inactive@example.com',
        role: 'student',
        isMember: false,
        currentMembership: null,
      });

      const res = await request(app)
        .post('/api/v1/attendance/check-in')
        .set('Authorization', `Bearer ${nonMemberToken}`)
        .send({ code: 'ABC123' });

      expect(res.status).toBe(403);
      expect(res.body.error.message).toMatch(/active membership required/i);
    });

    test('rejects email campaign dispatch by unauthenticated or student users', async () => {
      const mockUserId = '507f191e810c19729de860ea';
      const studentToken = generateToken({
        id: mockUserId,
        email: 'student@example.com',
        role: 'student',
      });

      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: mockUserId,
        name: 'Student User',
        email: 'student@example.com',
        role: 'student',
      });

      const res = await request(app)
        .post('/api/v1/email/campaigns')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ subject: 'Spam', htmlContent: '<p>Hi</p>' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('System Email Delivery Logs & Fee Status Correction', () => {
    test('creates and queries EmailDeliveryLog entries for admin review', async () => {
      const adminToken = generateToken({
        id: '507f1f77bcf86cd799439011',
        email: 'admin@libraryhub.in',
        role: 'admin',
      });

      jest.spyOn(Admin, 'findById').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@libraryhub.in',
        role: 'admin',
        isActive: true,
      });

      const sampleLog = await EmailDeliveryLog.create({
        recipientEmail: 'student.delivery@example.com',
        recipientName: 'Delivery Student',
        subject: '🎉 Congratulations! Your Library Hub Membership is Approved',
        htmlContent: '<p>Welcome to Library Hub</p>',
        emailType: 'ADMISSION_APPROVED',
        status: 'SENT',
        messageId: 'mock-delivery-12345',
        sentAt: new Date(),
      });

      expect(sampleLog._id).toBeDefined();
      expect(sampleLog.status).toBe('SENT');

      const res = await request(app)
        .get('/api/v1/admin/email-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.total).toBeGreaterThanOrEqual(1);

      // Cleanup
      await EmailDeliveryLog.findByIdAndDelete(sampleLog._id);
    });

    test('updates membership and applies feeAction MARK_UNPAID to reverse accidental payments', async () => {
      const adminToken = generateToken({
        id: '507f1f77bcf86cd799439011',
        email: 'admin@libraryhub.in',
        role: 'admin',
      });

      jest.spyOn(Admin, 'findById').mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Admin User',
        email: 'admin@libraryhub.in',
        role: 'admin',
        isActive: true,
      });

      const uniqueEmail = `feestudent_${Date.now()}@example.com`;
      const testUser = await User.create({
        name: 'Fee Adjustment Student',
        email: uniqueEmail,
        role: 'student',
      });

      const testMembership = await Membership.create({
        userId: testUser._id,
        planId: 'day-shift',
        planName: 'Day Shift Plan',
        slotType: 'DAY',
        shiftTimings: '7:00 AM - 8:00 PM',
        monthlyFeeInPaise: 50000,
        billingAnchorDay: 1,
        joiningDate: new Date(),
        status: 'active',
      });

      const now = new Date();
      const invoice = await FeeInvoice.create({
        invoiceNumber: `INV-TEST-${Date.now()}`,
        membershipId: testMembership._id,
        userId: testUser._id,
        periodKey: `${testMembership._id}_202611`,
        issueDate: now,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        billingPeriodStart: now,
        billingPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        feeAmountInPaise: 50000,
        amountPaidInPaise: 50000,
        balanceInPaise: 0,
        status: 'paid',
      });

      const receiptNo = generateReceiptNumber('RCP', now);
      const payment = await Payment.create({
        paymentNumber: receiptNo,
        receiptNumber: receiptNo,
        invoiceId: invoice._id,
        membershipId: testMembership._id,
        userId: testUser._id,
        amountInPaise: 50000,
        amountPaise: 50000,
        amountInRupees: 500,
        paymentMethod: 'CASH',
        paymentDate: now,
        isReversed: false,
      });

      const updateRes = await request(app)
        .put(`/api/v1/memberships/${testMembership._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          monthlyFeeInPaise: 50000,
          feeAction: 'MARK_UNPAID',
          reason: 'Correcting accidental paid status',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);

      const updatedInvoice = await FeeInvoice.findById(invoice._id);
      expect(updatedInvoice.status).toBe('unpaid');
      expect(updatedInvoice.amountPaidInPaise).toBe(0);
      expect(updatedInvoice.balanceInPaise).toBe(50000);

      const updatedPayment = await Payment.findById(payment._id);
      expect(updatedPayment.isReversed).toBe(true);

      await FeeInvoice.findByIdAndDelete(invoice._id);
      await Payment.findByIdAndDelete(payment._id);
      await Membership.findByIdAndDelete(testMembership._id);
      await User.findByIdAndDelete(testUser._id);
    });
  });
});
