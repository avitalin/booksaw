import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateResetToken,
  hashToken
} from '../../utils/crypto';

// Mock bcrypt
jest.mock('bcrypt');

describe('Crypto Utils', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'test_password';
      const hashedPassword = 'hashed_password';

      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(Number));
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'test_password';
      const hash = 'hashed_password';

      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(password, hash);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'wrong_password';
      const hash = 'hashed_password';

      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(password, hash);

      expect(result).toBe(false);
    });
  });

  describe('generateResetToken', () => {
    it('should generate reset token with correct format', () => {
      const result = generateResetToken();

      expect(result).toEqual({
        resetToken: expect.any(String),
        hashedToken: expect.any(String),
        expiresAt: expect.any(Date)
      });
    });
  });
}); 