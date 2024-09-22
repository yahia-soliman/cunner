import { BaseModel } from './index.js';

export interface Snippet extends BaseModel {
  language: string;
  version: string;
  code: string;
  result: {
    stdout: string;
    stderr: string;
    exitCode: number;
  }
}
