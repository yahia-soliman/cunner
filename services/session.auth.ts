import { redisClient } from '../utils/redis.js';
import { User, users } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import CunnErr from '../utils/error.js';
import { checkpw } from '../utils/hashing.js';
import { getUserById } from './user.js';

export const INVALID_CREDS_ERR = new CunnErr(401, 'Invalid Email or Password');
export const INVALID_TOKEN_ERR = new CunnErr(401, 'Invalid Token');
const SESSION_EXPIRY = 24 * 60 * 60;

/**
 * Extract credentials from a Basic Auth header
 * @param {string} basicAuth - The Basic Auth header string
 *
 * @returns {string[]} - An array of two strings: [email, password]
 */
export async function getCreds(basicAuth: string): Promise<string[]> {
  const base64Creds = basicAuth.split(' ')[1] || '';
  const credentials = Buffer.from(base64Creds, 'base64').toString('ascii');
  return credentials.split(':');
}

/**
 * Extract the session token from an Authorization header
 */
export function getSessionToken(authHeader?: string): string {
  const [kind, token] = authHeader?.split(' ') || [];
  if (kind !== 'Bearer' || !token) throw INVALID_TOKEN_ERR;
  return token;
}

/**
 * Create a session for a user
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 *
 * @returns {string} - The session token
 */
export async function createSession(
  email: string,
  password: string,
): Promise<string> {
  if (!email || !password) throw INVALID_CREDS_ERR;

  const user = await users.findOne({ email });

  if (!user) throw INVALID_CREDS_ERR;

  if (!checkpw(password, user.password)) throw INVALID_CREDS_ERR;

  const token = uuidv4();

  await redisClient.set(token, user._id.toString(), { EX: SESSION_EXPIRY });
  return token;
}

/**
 * Get the user associated with a session token
 * @param {string} authHeader - The session token
 *
 * @returns {Promise<User>} - The user object
 */
export async function getUser(authHeader: string | undefined): Promise<User> {
  const token = getSessionToken(authHeader);

  const _id = await redisClient.get(token);
  if (!_id) throw INVALID_TOKEN_ERR;

  const user = await getUserById(_id);
  if (!user) throw INVALID_TOKEN_ERR;

  return user;
}

/**
 * Delete a session token
 * @param {string} authHeader - The session token
 *
 * @throws {CunnErr} 401 - If the token is invalid
 */
export async function deleteSession(authHeader?: string) {
  const token = getSessionToken(authHeader);
  await redisClient.del(token);
}
