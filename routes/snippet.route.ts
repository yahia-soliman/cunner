import { FastifyInstance } from 'fastify';
import * as service from '../services/snippet.js';
import * as session from '../services/session.auth.js';
import { Snippet } from '../models/snippet.model.js';
import yup from 'yup';
import { defaultErrorResponse } from './index.js';

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
  const tags = ['Snippets'];
  const security = [{ bearerAuth: [] }];
  fastify.decorateRequest('userId', '');
  fastify.addHook('preValidation', async (req) => {
    const user = await session.getUser(req.headers.authorization);
    req.userId = user._id?.toString() || '';
  });

  fastify.post<ReqT>(
    '/',
    {
      schema: {
        body: yup.object(postBody).required('Empty body'),
        response: { 200: yup.object(resBody), default: defaultErrorResponse },
        description: 'Create a new snippet',
        security,
        tags,
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
        response: {
          200: yup.array().of(yup.object(resBody)),
          default: defaultErrorResponse,
        },
        description: 'Get all snippets created by the logged in user',
        tags,
        security,
      },
    },
    async (req) => {
      return service.allSnippets({ userId: req.userId });
    },
  );

  fastify.get<ReqT>(
    '/:id',
    {
      schema: {
        response: { 200: yup.object(resBody), default: defaultErrorResponse },
        description: 'Get a single snippet details by id',
        tags,
        security,
      },
    },
    async (request) => {
      const { id } = request.params;
      const snippet = await service.getById(id, { userId: request.userId });
      return snippet;
    },
  );

  fastify.patch<ReqT>(
    '/:id',
    {
      schema: {
        body: yup.object(patchBody).required('Empty body'),
        response: { 200: yup.object(resBody), default: defaultErrorResponse },
        description: 'Update a snippet by id',
        tags,
        security,
      },
    },
    async (request) => {
      const { id } = request.params;
      return service.updateSnippet(id, request.body, {
        userId: request.userId,
      });
    },
  );

  fastify.delete<ReqT>(
    '/:id',
    {
      schema: {
        response: { 200: yup.object({}), default: defaultErrorResponse },
        description: 'Delete a snippet by id',
        tags,
        security,
      },
    },
    async (request) => {
      const { id } = request.params;
      await service.deleteSnippet(id, { userId: request.userId });
      return {};
    },
  );
}
