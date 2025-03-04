import jwt from 'jsonwebtoken';
import { authenticateToken, hasPermission, hasRole } from '../../middleware/auth';
import { User } from '../../models/User';
import { AuthenticationError, AuthorizationError } from '../../utils/errors';

// Mock 依賴
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should throw error when no token provided', async () => {
      await authenticateToken(mockReq, mockRes, nextFunction);
      
      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });

    it('should authenticate valid token', async () => {
      const mockUser = {
        id: '123',
        tokenVersion: 1,
        isActive: true,
        passwordChangedAfter: jest.fn().mockReturnValue(false)
      };

      mockReq.headers.authorization = 'Bearer valid_token';
      jwt.verify.mockReturnValue({ id: '123', version: 1 });
      User.findById.mockResolvedValue(mockUser);

      await authenticateToken(mockReq, mockRes, nextFunction);

      expect(mockReq.user).toBe(mockUser);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should handle expired token', async () => {
      mockReq.headers.authorization = 'Bearer expired_token';
      jwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired');
      });

      await authenticateToken(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(AuthenticationError)
      );
    });
  });

  describe('hasPermission', () => {
    it('should allow access with correct permission', async () => {
      const mockUser = {
        id: '123',
        hasPermission: jest.fn().mockReturnValue(true)
      };
      
      mockReq.user = { id: '123' };
      User.findById.mockResolvedValue(mockUser);

      const middleware = hasPermission('test_permission');
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny access with incorrect permission', async () => {
      const mockUser = {
        id: '123',
        hasPermission: jest.fn().mockReturnValue(false)
      };
      
      mockReq.user = { id: '123' };
      User.findById.mockResolvedValue(mockUser);

      const middleware = hasPermission('test_permission');
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(AuthorizationError)
      );
    });
  });

  describe('hasRole', () => {
    it('should allow access with correct role', () => {
      mockReq.user = { role: 'admin' };
      
      const middleware = hasRole('admin', 'manager');
      middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should deny access with incorrect role', () => {
      mockReq.user = { role: 'user' };
      
      const middleware = hasRole('admin', 'manager');
      middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(
        expect.any(AuthorizationError)
      );
    });
  });
}); 