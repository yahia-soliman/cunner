import { FastifyInstance } from 'fastify';
import yup from 'yup';
import * as service from '../services/language.js';
import * as session from '../services/session.auth.js';
import { Language } from '../models/language.model.js';

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
  fastify.get(
    '/',
    {
      schema: { response: { 200: yup.array().of(yup.object(getAllRes)) } },
    },
    async () => service.getAll(),
  );
  fastify.get<CustomReq>(
    '/:name',
    {
      schema: { response: { 200: yup.object(getIdRes) } },
    },
    async (req) => service.getByName(req.params.name),
  );

  fastify.register(async function (fastify: FastifyInstance) {
    fastify.addHook('preValidation', async (req) => {
      const user = await session.getUser(req.headers.authorization);
      if (!user?.isAdmin) throw session.INVALID_TOKEN_ERR;
    });
    fastify.post<CustomReq>(
      '/',
      {
        schema: {
          body: yup.object(postBody).required('Empty body'),
          response: { 200: yup.object(getIdRes) },
        },
      },
      async (req) => {
        return service.newLanguage(req.body);
      },
    );

    fastify.post<CustomReq>('/:name/:version', async (request) => {
      const { name, version } = request.params;
      return service.newVersion(name, version);
    });

    fastify.put<CustomReq>(
      '/:name/cmd',
      {
        schema: { body: yup.array(yup.string()).min(1).required('Empty body') },
      },
      async (request) => {
        // we currently update only the cmd
        const cmd = request.body as unknown;
        const { name } = request.params;
        return service.updateCmd(name, cmd as string[]);
      },
    );

    fastify.delete<CustomReq>('/:name', async (request) => {
      const { name } = request.params;
      return service.deleteLanguage(name);
    });

    fastify.delete<CustomReq>('/:name/:version', async ({ params }) =>
      service.deleteVersion(params.name, params.version),
    );
  });
}
