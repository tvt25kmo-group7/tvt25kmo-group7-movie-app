import { createHash } from 'node:crypto';

const revokedTokens = new Map();

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function removeExpiredTokens() {
  const now = Date.now();

  for (const [tokenHash, expiresAt] of revokedTokens) {
    if (expiresAt <= now) {
      revokedTokens.delete(tokenHash);
    }
  }
}

function revokeToken(token, expiresAt) {
  removeExpiredTokens();
  revokedTokens.set(hashToken(token), expiresAt * 1000);
}

function isTokenRevoked(token) {
  removeExpiredTokens();
  return revokedTokens.has(hashToken(token));
}

export { revokeToken, isTokenRevoked };