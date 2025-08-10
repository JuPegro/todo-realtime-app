import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;

  beforeEach(() => {
    service = new TokenBlacklistService();
  });

  describe('addToBlacklist', () => {
    it('should add token to blacklist', () => {
      const token = 'test-token';

      service.addToBlacklist(token);

      expect(service.isBlacklisted(token)).toBe(true);
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for blacklisted token', () => {
      const token = 'blacklisted-token';
      service.addToBlacklist(token);

      const result = service.isBlacklisted(token);

      expect(result).toBe(true);
    });

    it('should return false for non-blacklisted token', () => {
      const token = 'valid-token';

      const result = service.isBlacklisted(token);

      expect(result).toBe(false);
    });
  });

  describe('cleanExpiredTokens', () => {
    it('should remove expired tokens from blacklist', () => {
      const token1 = 'expired-token-1';
      const token2 = 'expired-token-2';
      const validToken = 'valid-token';

      // Add tokens to blacklist
      service.addToBlacklist(token1);
      service.addToBlacklist(token2);
      service.addToBlacklist(validToken);

      // Clean expired tokens
      service.cleanExpiredTokens([token1, token2]);

      expect(service.isBlacklisted(token1)).toBe(false);
      expect(service.isBlacklisted(token2)).toBe(false);
      expect(service.isBlacklisted(validToken)).toBe(true);
    });
  });
});