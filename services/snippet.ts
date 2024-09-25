import { snippets, Snippet } from '../models/snippet.model.js';
import * as languageService from './language.js';
import CunnErr from '../utils/error.js';
import { execute } from './execute.js';
import { ObjectId } from 'mongodb';

export const SNIPPET_404_ERR = new CunnErr(404, 'Snippet not found');

export async function newSnippet(obj: Snippet) {
  const lang = await languageService.getByName(obj.language);

  if (!lang.versions.includes(obj.version)) {
    throw new CunnErr(
      404,
      `Version not supported try any of (${lang.versions.join(', ')})`,
    );
  }

  delete obj._id;
  obj.updated = obj.created = new Date();
  const res = await snippets.insertOne(obj);
  return { ...obj, _id: res.insertedId };
}

export function allSnippets(filter: Partial<Snippet>, page = 0, perPage = 5) {
  const res = snippets.aggregate([
    { $match: filter },
    { $skip: page * perPage },
    { $limit: perPage },
  ]);
  return res.toArray();
}

export async function getById(
  _id: string,
  filter: Partial<Snippet> = {},
): Promise<Snippet> {
  if (ObjectId.isValid(_id)) {
    _id = new ObjectId(_id) as unknown as string;
  }
  const doc = await snippets.findOne({ ...filter, _id });
  if (!doc) throw SNIPPET_404_ERR;
  return doc;
}

export async function updateSnippet(
  _id: string,
  updates: Partial<Snippet>,
  filter: Partial<Snippet> = {},
): Promise<Snippet> {
  delete updates._id;
  delete updates.result;
  delete updates.created;
  delete updates.updated;

  if (ObjectId.isValid(_id)) {
    _id = new ObjectId(_id) as unknown as string;
  }
  const doc = await snippets.findOneAndUpdate(
    { ...filter, _id },
    { $set: { ...updates, updated: new Date() }, $unset: { result: true } },
  );
  if (!doc) throw SNIPPET_404_ERR;
  return { ...doc, ...updates };
}

export async function deleteSnippet(
  _id: string,
  filter: Partial<Snippet> = {},
) {
  if (ObjectId.isValid(_id)) {
    _id = new ObjectId(_id) as unknown as string;
  }

  const result = await snippets.deleteOne({ ...filter, _id });
  if (result.deletedCount === 0) throw SNIPPET_404_ERR;
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
