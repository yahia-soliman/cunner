import { BaseModel, db } from './index.js';

export const users = db.collection<User>('users');

export interface User extends BaseModel {
  name: string,
  email: string,
  password: string,
  isAdmin?: boolean,
}
