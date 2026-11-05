import request from 'supertest';
import { jest } from '@jest/globals';
import app from '../src/app.js';
import { Admin, User } from '../src/models/index.js';
import { generateToken } from '../src/utils/token.js';
import { connectDatabase } from '../src/config/db.js';

describe('Phase 03: Authentication and Access Control', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 25000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Student Google Authentication', () => {
    it('signs in enrolled student via Google token', async () => {
      // Mock User.findOne to simulate pre-enrolled student
      const enrolledStudent = {
        _id: '507f1f77bcf86cd799439011',
        googleId: 'mock-gid-12345',
        email: 'rahul.sharma@example.com',
        name: 'RAHUL SHARMA',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        phone: '9876543210',
        targetExam: 'UPSC CSE',
        role: 'student',
        isMember: true,
        currentMembership: null,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(enrolledStudent);

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({
          idToken: 'mock-token-rahul.sharma@example.com',
          phone: '9876543210',
          targetExam: 'UPSC CSE',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'rahul.sharma@example.com');
      expect(res.body.data.user.role).toBe('student');
    });

    it('rejects student sign-in if email is not pre-enrolled by admin', async () => {
      // Mock User.findOne to return null (unenrolled)
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({
          idToken: 'mock-token-unknown.student@gmail.com',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_ENROLLED');
    });

    it('rejects student sign-in if student account is inactive or missing attendance for 2 consecutive days', async () => {
      const inactiveStudent = {
        _id: '507f1f77bcf86cd799439011',
        googleId: 'mock-gid-12345',
        email: 'inactive.student@example.com',
        name: 'INACTIVE STUDENT',
        isActive: false,
        role: 'student',
        isMember: false,
        deactivationReason: 'Auto-deactivated: No attendance marked for 2 consecutive days',
        currentMembership: null,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(inactiveStudent);

      const res = await request(app)
        .post('/api/v1/auth/google')
        .send({ idToken: 'mock-token-inactive.student@example.com' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_INACTIVE');
    });

    it('rejects student sign-in with missing idToken', async () => {
      const res = await request(app).post('/api/v1/auth/google').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Admin Email/Password Authentication', () => {
    it('rejects admin login with invalid email or missing password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({ email: 'not-an-email', password: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('rejects admin login with incorrect password with generic message', async () => {
      // Mock admin found with comparePassword returning false
      jest.spyOn(Admin, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439099',
          email: 'admin@libraryhub.in',
          isActive: true,
          comparePassword: jest.fn().mockResolvedValue(false),
        }),
      });

      const res = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({ email: 'admin@libraryhub.in', password: 'WrongPassword456' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('successfully authenticates admin with valid password and sets cookie', async () => {
      // Mock admin found with comparePassword returning true
      const mockAdmin = {
        _id: '507f1f77bcf86cd799439099',
        name: 'Library Hub Admin',
        email: 'admin@libraryhub.in',
        role: 'admin',
        isActive: true,
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Admin, 'findOne').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });

      const res = await request(app)
        .post('/api/v1/auth/admin/login')
        .send({ email: 'admin@libraryhub.in', password: 'ValidPassword123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.admin).toHaveProperty('email', 'admin@libraryhub.in');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });

  describe('Protected Session & Access Verification', () => {
    it('blocks access to /api/v1/auth/me without an authentication token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('allows access to /api/v1/auth/me with a valid Bearer token', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const validToken = generateToken({
        id: mockUserId,
        email: 'priya.verma@example.com',
        role: 'student',
      });

      jest.spyOn(User, 'findById').mockResolvedValue({
        _id: mockUserId,
        name: 'Priya Verma',
        email: 'priya.verma@example.com',
        phone: '9898989898',
        picture: null,
        role: 'student',
        currentMembership: null,
      });

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.email).toBe('priya.verma@example.com');
      expect(meRes.body.data.role).toBe('student');
    });

    it('clears session on logout', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
