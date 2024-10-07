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

const postQuery = {
  language: yup.string().required(),
  version: yup.string().required(),
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

  fastify.post(
    '/',
    {
      schema: {
        consumes: ['text/plain'],
        querystring: yup.object(postQuery),
        body: yup.string().required('Empty Body: provide the code snippet'),
        response: { 200: yup.object(resBody)},
        description: 'Create a new snippet\n\n- Provide metadata in the querystring\n- And the code snippet in the body',
        security,
        tags,
      },
    },
    async (req) => {
      const { language, version } = req.query as Snippet;
      return service.newSnippet({
        language,
        version,
        code: req.body as string,
        userId: req.userId,
      });
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

  fastify.get<ReqT>(
    '/:id/run',
    {
      schema: {
        response: { 200: yup.object(resBody), default: defaultErrorResponse },
        description: 'Run a snippet by id',
        tags,
        security,
      },
    },
    async (request) => {
      const { id } = request.params;
      const snippet = await service.getById(id, { userId: request.userId });
      const result = await service.runSnippet(snippet);
      return { ...snippet, result };
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
        response: { default: defaultErrorResponse },
        description: 'Delete a snippet by id',
        tags,
        security,
      },
    },
    async (request) => {
      const { id } = request.params;
      await service.deleteSnippet(id, { userId: request.userId });
      return { message: 'deleted the snippet' };
    },
  );
}
