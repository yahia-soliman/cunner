import mongoose from 'mongoose';
import { BaseModel, schemaDefaults } from './index.js';

interface Isnippet extends BaseModel {
  language: string;
  version: string;
  code: string;
  result: {
    stdout: string;
    stderr: string;
    exitCode: number;
  }
}

const snippetSchema = new mongoose.Schema<Isnippet>({
  ...schemaDefaults,
  language: String,
  version: String,
  code: String,
  result: {
    stdout: String,
    stderr: String,
    exitCode: Number,
  },
});

const Snippet = mongoose.model<Isnippet>('Snippet', snippetSchema);

export default Snippet;
