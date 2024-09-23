import { languages } from '../models/language.model.js';
import { Language } from '../models/language.model.js';
import docker from '../utils/docker/index.js';
import CunnErr from '../utils/error.js';

/**
 * Get all supported languages
 * @returns { Language[] }
 */
export async function getAll(): Promise<Language[]> {
  return await languages.find({}).toArray();
}

/**
 * Get a language by its name
 * @throws 404 Error: when the language is not found
 */
export async function getByName(name: string): Promise<Language> {
  const doc = await languages.findOne({ name });
  if (!doc) throw new CunnErr(404, `Language ${name} Not found`);
  return doc;
}

/**
 * Install a new image for a language
 * @throws 404 Error: when the image is not found
 * @throws 500 Error: when there is an internal server error
 */
async function __installImage(langName: string, version: string) {
  const image = `${langName}:${version}`;
  const res = await docker.pull(image);
  if (res.statusCode === 404)
    throw new CunnErr(404, `No Docker image found for ${image}`);
  if (res.statusCode === 500)
    throw new CunnErr(500, 'Internal Server Error with Docker');
}

/**
 * Support new version language by the application
 * @throws 409 Error: when the language already exists
 * @throws 500 Error: when there is an internal server error
 * @returns { language: Language, errors: string[] }
 */
export async function newLanguage(
  language: Language,
): Promise<{ language: Language; errors: string[] }> {
  const doc = await languages.findOne({ name: language.name });
  if (doc) throw new CunnErr(409, 'Language already exists');

  const errors: string[] = [];
  language.versions = language.versions.filter(async (v) => {
    try {
      await __installImage(language.name, v);
      return true;
    } catch (err) {
      errors.push((err as CunnErr).message);
      return false;
    }
  });

  language.created = language.updated = new Date();
  const { acknowledged } = await languages.insertOne(language);
  if (!acknowledged) throw new CunnErr(500, 'Internal Server Error');

  return { language, errors };
}

/**
 * Support new version of a language by the application
 * @throws 404 Error: when the language is not found
 * @throws 409 Error: when the version already exists
 * @throws 500 Error: when there is an internal server error
 * @returns { Language } Object
 */
export async function newVersion(
  langName: string,
  version: string,
): Promise<Language> {
  const result = await languages.updateOne(
    { name: langName },
    {
      $set: { updated: new Date() },
      $addToSet: { versions: version },
    },
  );

  if (result.matchedCount < 1)
    throw new CunnErr(404, `Language ${langName} Not found`);
  if (result.modifiedCount < 1)
    throw new CunnErr(409, `Version ${version} already exists`);

  await __installImage(langName, version);

  return await getByName(langName);
}

/**
 * Update the command to execute a script inside a container
 * @throws 404 Error: when the language is not found
 */
export async function updateCmd(langName: string, newCmd: string[]) {
  const res = await languages.updateOne(
    { name: langName },
    {
      $set: { cmd: newCmd, updated: new Date() },
    },
  );
  if (res.matchedCount < 1)
    throw new CunnErr(404, `Language ${langName} Not found`);
}

/**
 * Deletes a docker image
 * @throws 409 Error: when the image is being used
 * @throws 500 Error: when there is an internal server error
 */
async function __removeImage(langName: string, version: string) {
  const image = `${langName}:${version}`;
  const res = await docker.image.rm(image);
  if (res.statusCode === 409)
    throw new CunnErr(409, `Conflict: ${image} is being used`);
  if (res.statusCode === 500)
    throw new CunnErr(500, 'Internal Server Error with Docker');
}

/**
 * Delete a specific version from a language, and its corresponding docker image
 * @throws 404 Error: when the version is not found
 * @throws 409 Error: when the image is being used
 * @throws 500 Error: when there is an internal server error
 * @returns true if the version was deleted
 */
export async function deleteVersion(
  langName: string,
  version: string,
): Promise<boolean> {
  const doc = await getByName(langName);
  if (!doc.versions.includes(version))
    throw new CunnErr(404, `${langName} version ${version} Not found`);
  await __removeImage(langName, version);
  const res = await languages.updateOne(
    { name: langName },
    {
      $set: { updated: new Date() },
      $pull: { versions: version },
    },
  );
  return res.modifiedCount > 0;
}

/**
 * Delete a Language Object, All of its versions, and all corresponding images
 * @throws 404 Error: when the language is not found
 * @throws 500 Error: when there is an internal server error
 */
export async function deleteLanguage(langName: string): Promise<boolean> {
  const lang = await getByName(langName);
  lang.versions.forEach(async (v) => {
    await __removeImage(langName, v);
  });
  const res = await languages.deleteOne({ name: langName });
  return res.deletedCount > 0;
}
