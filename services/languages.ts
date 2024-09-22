import { db } from '../models/index.js';
import { Language } from '../models/language.model.js';
import CunnErr from '../utils/error.js';

const languages = db.collection('languages');

export async function getAll() {
  return await languages.find<Language>({}).toArray();
}

/**
 * Get a language
 * @throws 404 Error: when the language is not found
 */
export async function getByName(name: string): Promise<Language> {
  const doc = await languages.findOne<Language>({ name });
  if (!doc) throw new CunnErr(404, `Language ${name} Not found`);
  return doc;
}

/** Support new version language by the application */
export async function newLanguage(language: Language) {
  const doc = await languages.findOne<Language>({ name: language.name });
  if (doc) throw new CunnErr(409, "language already exists");

  const res = await languages.insertOne(language);
  return res.acknowledged;
}

/** update the command to execute a script inside a container */
export async function updateCmd(langName: string, newCmd: string[]) {
  const res = await languages.updateOne(
    { name: langName },
    {
      $set: { cmd: newCmd },
    },
  );
  if (res.matchedCount < 1)
    throw new CunnErr(404, `Language ${langName} Not found`);
}

/** Delete a specific version from a language, and its corresponding docker image */
export async function deleteVersion(language: string, version: string) {
  const doc = await getByName(language);
  if (!doc.versions.includes(version))
    throw new CunnErr(404, `${language} version ${version} Not found`);
}

/** Delete a Language Object, All of its versions, and all corresponding images */
export async function deleteLanguage(name: string) {
  const res = await languages.deleteOne({ name });
  if (res.deletedCount < 1)
    throw new CunnErr(404, `Language ${name} Not found`);
  return { deleted: true };
}
