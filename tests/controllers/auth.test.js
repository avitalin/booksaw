import authController from '../../controllers/authController';
import { User } from '../../models/User';
import { hashPassword, comparePassword, generateResetToken } from '../../utils/crypto';
import { auditLogger } from '../../utils/logger';
import { sendResetPasswordEmail } from '../../utils/email';
import { AuthenticationError } from '../../utils/errors';

// Mock 依賴
jest.mock('../../models/User');
jest.mock('../../utils/crypto');
jest.mock('../../utils/logger');
jest.mock('../../utils/email');

describe('Auth Controller', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      ip: '127.0.0.1',
      get: jest.fn()
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };
      mockReq.body = userData;

      const mockUser = {
        id: '123',
        email: userData.email,
        name: userData.name,
        role: 'user'
      };

      User.findByEmail.mockResolvedValue(null);
      hashPassword.mockResolvedValue('hashed_password');
      User.create.mockResolvedValue(mockUser);

      await authController.register(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: userData.email,
            name: userData.name
          })
        })
      );
    });

    it('should handle duplicate email', async () => {
      mockReq.body = {
        email: 'existing@example.com',
        password: 'password123'
      };

      User.findByEmail.mockResolvedValue({ id: '123' });

      await authController.register(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockReq.body = credentials;

      const mockUser = {
        id: '123',
        email: credentials.email,
        password: 'hashed_password',
        isActive: true
      };

      User.findByEmail.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);

      await authController.login(mockReq, mockRes, nextFunction);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String)
        })
      );
    });

    it('should handle invalid credentials', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'wrong_password'
      };

      User.findByEmail.mockResolvedValue(null);

      await authController.login(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
      expect(auditLogger.securityEvent).toHaveBeenCalledWith(
        'failed_login_attempt',
        expect.any(Object)
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockReq.body = {
        currentPassword: 'old_password',
        newPassword: 'new_password'
      };
      mockReq.user = { id: '123' };

      const mockUser = {
        id: '123',
        password: 'hashed_old_password'
      };

      User.findById.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      hashPassword.mockResolvedValue('hashed_new_password');

      await authController.changePassword(mockReq, mockRes, nextFunction);

      expect(User.updatePassword).toHaveBeenCalledWith(
        '123',
        'hashed_new_password'
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String)
        })
      );
    });
  });
}); 