import { ObjectId } from 'mongodb';
import { User, users } from '../models/user.model.js';
import CunnErr from '../utils/error.js';
import { hashpw } from '../utils/hashing.js';

const USER_NOT_FOUND_ERR = new CunnErr(404, 'User not found');

export async function newUser(obj: User) {
  const { email } = obj;

  const user = await users.findOne({ email });

  if (user) throw new CunnErr(409, 'User already exists');

  obj.created = obj.updated = new Date();
  obj.password = hashpw(obj.password);
  delete obj.isAdmin;
  const res = await users.insertOne(obj);

  return { ...obj, _id: res.insertedId };
}

export async function allUsers() {
  const res = users.find();
  return res.toArray();
}

export async function getUserById(id: string) {
  const _id: unknown = new ObjectId(id);
  const user = await users.findOne({ _id: _id as string });
  if (!user) throw USER_NOT_FOUND_ERR;
  return user;
}

export async function updateUser(_id: string, updates: Partial<User>) {
  delete updates._id;
  delete updates.isAdmin;
  delete updates.created;
  delete updates.updated;

  const doc = await users.findOneAndUpdate(
    { _id },
    { $set: { ...updates, updated: new Date() } },
  );
  if (!doc) throw USER_NOT_FOUND_ERR;
  return { ...doc, ...updates };
}

export async function deleteUser(_id: string) {
  const result = await users.deleteOne({ _id });
  if (result.deletedCount === 0) throw USER_NOT_FOUND_ERR;
  return true;
}
