import { FastifyInstance } from 'fastify';
import yup from 'yup';
import * as service from '../services/language.js';
import * as session from '../services/session.auth.js';
import { Language } from '../models/language.model.js';
import { defaultErrorResponse } from './index.js';

interface CustomReq {
  Params: { name: string; version: string };
  Body: Language;
}

const defaultProps = {
  created: yup.date(),
  updated: yup.date(),
};

const getAllRes = {
  name: yup.string(),
  versions: yup.array().of(yup.string()),
};

const getIdRes = { ...getAllRes, ...defaultProps };

const postBody = {
  name: yup.string().required(),
  versions: yup.array().of(yup.string()).required(),
  cmd: yup.array().of(yup.string()).required().min(1),
};

/**
 * Encapsulates the controller and validation logic for the language service
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export default async function route(fastify: FastifyInstance) {
  const tags = ['Languages'];
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: yup.array().of(yup.object(getAllRes)),
          default: defaultErrorResponse,
        },
        description: 'Get all supported languages',
        tags,
      },
    },
    async () => service.getAll(),
  );
  fastify.get<CustomReq>(
    '/:name',
    {
      schema: {
        response: { 200: yup.object(getIdRes) },
        description: 'Get language details by name',
        tags,
      },
    },
    async (req) => service.getByName(req.params.name),
  );

  fastify.register(async function (fastify: FastifyInstance) {
    const tags = ['Admin'];
    const security = [{ bearerAuth: [] }];
    fastify.addHook('preValidation', async (req) => {
      const user = await session.getUser(req.headers.authorization);
      if (!user?.isAdmin) throw session.INVALID_TOKEN_ERR;
    });
    fastify.post<CustomReq>(
      '/',
      {
        schema: {
          body: yup.object(postBody).required('Empty body'),
          response: {
            200: yup.object(getIdRes),
            default: defaultErrorResponse,
          },
          description: 'Add and support a new language',
          security,
          tags,
        },
      },
      async (req) => {
        return service.newLanguage(req.body);
      },
    );

    fastify.post<CustomReq>(
      '/:name/:version',
      {
        schema: {
          response: {
            200: yup.object(getIdRes),
            default: defaultErrorResponse,
          },
          description: 'Add a new version to a language',
          security,
          tags,
        },
      },
      async (request) => {
        const { name, version } = request.params;
        return service.newVersion(name, version);
      },
    );

    fastify.put<CustomReq>(
      '/:name/cmd',
      {
        schema: {
          body: yup.array(yup.string()).min(1).required('Empty body'),
          response: {
            200: yup.object(getIdRes),
            default: defaultErrorResponse,
          },
          description: 'Update the command used for running code snippets',
          security,
          tags,
        },
      },
      async (request) => {
        // we currently update only the cmd
        const cmd = request.body as unknown;
        const { name } = request.params;
        return service.updateCmd(name, cmd as string[]);
      },
    );

    fastify.delete<CustomReq>(
      '/:name',
      {
        schema: {
          response: {
            200: yup.object(getIdRes),
            default: defaultErrorResponse,
          },
          description: 'Delete a language, and all its versions',
          security,
          tags,
        },
      },
      async (request) => {
        const { name } = request.params;
        return service.deleteLanguage(name);
      },
    );

    fastify.delete<CustomReq>(
      '/:name/:version',
      {
        schema: {
          response: {
            200: yup.object(getIdRes),
            default: defaultErrorResponse,
          },
          description: 'Delete a version of a language',
          security,
          tags,
        },
      },
      async ({ params }) => {
        await service.deleteVersion(params.name, params.version);
      },
    );
  });
}
