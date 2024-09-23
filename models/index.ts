import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost';
const DB_NAME = process.env.DB_NAME || 'test'
const client = new MongoClient(MONGO_URL);
export const db = client.db(DB_NAME);

export interface BaseModel {
  _id?: string;
  created?: Date;
  updated?: Date;
}

try {
  await client.connect();
  console.log(`connected to ${MONGO_URL}/${DB_NAME}`);
} catch (err) {
  console.log('database connection Failed:\n' + err);
  process.exit(1);
}
