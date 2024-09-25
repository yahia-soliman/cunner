import { redisClient } from '../utils/redis.js';
import { User, users } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import CunnErr from '../utils/error.js';
import { checkpw } from '../utils/hashing.js';

const INVALID_CREDS_ERR = new CunnErr(401, 'Invalid Email or Password');
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

  await redisClient.set(token, user._id, { EX: SESSION_EXPIRY });
  return token;
}

/**
 * Get the user associated with a session token
 * @param {string} token - The session token
 *
 * @returns {Promise<User>} - The user object
 */
export async function getUser(token: string): Promise<User> {
  if (!token) throw new CunnErr(401);

  const _id = await redisClient.get(token);
  if (!_id) throw new CunnErr(401);

  const user = await users.findOne({ _id });
  if (!user) throw new CunnErr(401);

  return user;
}

/**
 * Delete a session token
 * @param {string} token - The session token
 *
 * @throws {CunnErr} 401 - If the token is invalid
 */
export async function deleteSession(token: string) {
  await getUser(token);
  await redisClient.del(token);
}
