import { BaseModel, db } from './index.js';

export const languages = db.collection<Language>('languages');

languages.createIndex({ name: 1 }, { unique: true });

export interface Language extends BaseModel {
  name: string;
  versions: string[];
  cmd: string[];
}
