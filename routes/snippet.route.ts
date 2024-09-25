import { FastifyInstance } from 'fastify';
import * as service from '../services/snippet.js';
import * as session from '../services/session.auth.js';
import { Snippet } from '../models/snippet.model.js';
import yup from 'yup';

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}
interface ReqT {
  Params: { id: string };
  Body: Snippet;
}

const postBody = {
  language: yup.string().required(),
  version: yup.string().required(),
  code: yup.string().required().min(3),
};

const patchBody = {
  version: yup.string(),
  language: yup.string(),
  code: yup.string().min(3),
};
const resBody = {
  ...patchBody,
  _id: yup.string(),
  result: yup.object({
    stdout: yup.string(),
    stderr: yup.string(),
    exitCode: yup.number(),
  }),
};

/**
 * Encapsulates the controller and validation for snippet service
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export default async function route(fastify: FastifyInstance) {
  fastify.decorateRequest('userId', '');
  fastify.addHook('preHandler', async (req) => {
    const user = await session.getUser(req.headers.authorization);
    req.userId = user._id?.toString() || '';
  });

  fastify.post<ReqT>(
    '/',
    {
      schema: {
        body: yup.object(postBody).required('Empty body'),
        response: { 200: yup.object(resBody) },
      },
    },
    async (req) => {
      return service.newSnippet({ ...req.body, userId: req.userId });
    },
  );

  fastify.get(
    '/',
    {
      schema: {
        response: { 200: yup.array().of(yup.object(resBody)) },
      },
    },
    async (req) => {
      return service.allSnippets({ userId: req.userId });
    },
  );

  fastify.get<ReqT>('/:id', async (request) => {
    const { id } = request.params;
    const snippet = await service.getById(id, { userId: request.userId });
    return snippet;
  });

  fastify.patch<ReqT>(
    '/:id',
    {
      schema: {
        body: yup.object(patchBody).required('Empty body'),
        response: { 200: yup.object(resBody) },
      },
    },
    async (request) => {
      const { id } = request.params;
      return service.updateSnippet(id, request.body, {
        userId: request.userId,
      });
    },
  );

  fastify.delete<ReqT>('/:id', async (request) => {
    const { id } = request.params;
    await service.deleteSnippet(id, { userId: request.userId });
    return {};
  });
}
