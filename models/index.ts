import { Collection, Db, MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost';
const DB_NAME = process.env.DB_NAME || 'test'
const client = new MongoClient(MONGO_URL);
export const db = client.db(DB_NAME);


export class Model extends Collection {}
export class DB extends Db {
  get languages() { return this.collection('languages') }
  get snippets() { return this.collection('snippets') }
}

export interface BaseModel {
  created: Date;
  updated: Date;
}

try {
  await client.connect();
  console.log(`connected to ${MONGO_URL}/${DB_NAME}`);
} catch (err) {
  console.log('database connection Failed:\n' + err);
  process.exit(1);
}
