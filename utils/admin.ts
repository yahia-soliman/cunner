import { hashpw } from '../utils/hashing.js';
import { users } from '../models/user.model.js';

export async function createAdmins() {
  const name = process.env.ADMIN_NAME || 'a';
  const email = process.env.ADMIN_EMAIL;
  const pass = process.env.ADMIN_PASS;
  if (!(email && pass)) return;
  const password = hashpw(pass);
  const admin = await users.findOne({ email });
  if (admin) {
    await users.updateOne({ email }, { $set: { password, isAdmin: true } });
  } else {
    await users.deleteMany({ isAdmin: true });
    await users.insertOne({ name, email, password, isAdmin: true });
  }
}
