import { FastifyInstance } from 'fastify';
import * as service from '../services/snippet.js';
import { Snippet } from '../models/snippet.model.js';
import yup from 'yup';

const postBody = {
  language: yup.string().required(),
  version: yup.string().required(),
  code: yup.string().required().min(3),
};

/**
 * Encapsulates the controller and validation for snippet service
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export default async function route(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        body: yup.object(postBody).required(),
        response: { 200: yup.object(postBody) },
      },
    },
    async (req) => {
      return service.newSnippet(req.body as Snippet);
    },
  );

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
