import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import * as service from '../services/snippet.js';
import { Snippet } from '../models/snippet.model.js';

const postBodySchema = {
  language: { type: 'string' },
  version: { type: 'string' },
  code: { type: 'string' },
};

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['language', 'version', 'code'],
      properties: postBodySchema,
    },
    response: {
      200: {
        type: 'object',
        properties: {
          ...postBodySchema,
          created: { type: 'string' },
          updated: { type: 'string' },
          id: { type: 'string' },
        },
      }
    },
  },
};

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export default async function route(fastify: FastifyInstance) {
  fastify.post('/', opts, async (req) => {
    return service.newSnippet(req.body as Snippet);
  });

  fastify.get('/', async () => {
    return service.allSnippets({});
  });

  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return service.getById(id);
  });

  fastify.patch('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return service.updateSnippet(id, request.body as Snippet);
  });

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return service.deleteSnippet(id);
  });
}
