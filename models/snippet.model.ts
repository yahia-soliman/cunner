import { BaseModel, db } from './index.js';

export const snippets = db.collection<Snippet>('snippets');

export interface Snippet extends BaseModel {
  language: string;
  version: string;
  code: string;
  result?: {
    stdout: string;
    stderr: string;
    exitCode: number;
  };
}
