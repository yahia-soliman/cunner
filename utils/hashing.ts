import { randomBytes, scryptSync } from 'crypto';

/**
 * Hash password with random salt
 * @param {string} password - the plain password to hash
 * @param {string} salt - an optional salt, use it with caution
 *
 * @returns {string} - the password's salted hash followed by the salt
 */
export function hashpw(password: string, salt?: string): string {
  salt ||= randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return hash + salt;
}

/**
 * Check plain password against a hash done with `hashpw`
 * @param {string} password - The plain text password submitted by a user
 * @param {string} hash - The original hash of the user's registered password
 *
 * @returns {boolean} - true if the password matches the hash
 */
export function checkpw(password: string, hash: string): boolean {
  const salt = hash.slice(64);
  const newHash = hashpw(password, salt);
  return newHash === hash;
}
