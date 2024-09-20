import mongoose from 'mongoose';
import { BaseModel, schemaDefaults } from './index.js';

interface Ilanguage extends BaseModel {
  name: string;
  versions: string[];
  cmd: string;
}

const languageSchema = new mongoose.Schema<Ilanguage>({
  ...schemaDefaults,
  name: String,
  versions: [String],
  cmd: String,
});

const Language = mongoose.model<Ilanguage>('Language', languageSchema);

export default Language;
