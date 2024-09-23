import { FindOptions } from 'mongodb';
import { snippets, Snippet } from '../models/snippet.model.js';
import * as languageService from './language.js';
import CunnErr from '../utils/error.js';
import { execute } from './execute.js';

export async function newSnippet(obj: Snippet) {
  // check for the language and version support
  const lang = await languageService.getByName(obj.language);

  if (!lang.versions.includes(obj.version)) {
    throw new CunnErr(
      404,
      `Version not supported try any of (${lang.versions.join(', ')})`,
    );
  }
  const res = await snippets.insertOne(obj);
  return { ...obj, _id: res.insertedId };
}

export function allSnippets(filter: FindOptions, page = 0, perPage = 5) {
  const res = snippets.aggregate([
    { $match: filter },
    { $skip: page * perPage },
    { $limit: perPage },
  ]);
  return res.toArray();
}

export async function getById(_id: string): Promise<Snippet> {
  const doc = await snippets.findOne({ _id });
  if (!doc) throw new CunnErr(404, 'Snippet not found');
  return doc;
}

export async function updateSnippet(
  _id: string,
  updates: Partial<Snippet>,
): Promise<Snippet> {
  delete updates._id;
  delete updates.result;
  delete updates.created;
  delete updates.updated;

  const doc = await snippets.findOneAndUpdate(
    { _id },
    { $set: { ...updates, updated: new Date() }, $unset: { result: true } },
  );
  if (!doc) throw new CunnErr(404, 'Snippet not found');
  return { ...doc, ...updates };
}

export async function deleteSnippet(_id: string) {
  const result = await snippets.deleteOne({ _id });
  if (result.deletedCount === 0) throw new CunnErr(404, 'Snippet not found');
  return true;
}

export async function runSnippet(obj: Snippet) {
  const { language, version, code } = obj;
  const languageDoc = await languageService.getByName(language);
  if (!languageDoc.versions.includes(version)) {
    throw new CunnErr(404, `Version ${version} is no longer supported`);
  }
  try {
    await execute(`${languageDoc.name}:${version}`, languageDoc.cmd, code);
  } catch (err) {
    throw new CunnErr(500, (err as Error).message);
  }
}
