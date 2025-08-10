import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private blacklistedTokens = new Set<string>();

  addToBlacklist(token: string): void {
    this.blacklistedTokens.add(token);
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // Método para limpiar tokens expirados periódicamente
  cleanExpiredTokens(expiredTokens: string[]): void {
    expiredTokens.forEach(token => {
      this.blacklistedTokens.delete(token);
    });
  }
}