import { FindOptions } from 'mongodb';
import { db } from '../models/index.js';
import { Snippet } from '../models/snippet.model.js';

const snippets = db.collection<Snippet>('snippets');

export function get(filter: FindOptions , page = 0, perPage = 5) {
  return snippets.aggregate([
    { $match: filter },
    { $skip: page * perPage },
    { $limit: perPage },
  ]);
}

export async function add(obj: Snippet) {
  return await snippets.insertOne(obj);
}
