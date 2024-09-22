import { BaseModel } from './index.js';

export interface Language extends BaseModel {
  name: string;
  versions: string[];
  cmd: string[];
}
