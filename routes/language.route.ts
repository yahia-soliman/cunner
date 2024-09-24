import { FastifyInstance } from 'fastify';
import * as service from '../services/language.js';
import { Language } from '../models/language.model.js';
import yup from 'yup';

interface BodyOrParams {
  name: string;
  version: string;
  versions: string[];
  cmd: string[];
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
  fastify.post<{ Body: Language }>(
    '/',
    {
      schema: {
        body: yup.object(postBody).required(),
        response: { 200: yup.object(getIdRes) },
      },
    },
    async (req) => {
      return service.newLanguage(req.body);
    },
  );

  fastify.post<{ Params: BodyOrParams }>('/:name/:version', async (request) => {
    const { name, version } = request.params;
    return service.newVersion(name, version);
  });

  fastify.get(
    '/',
    {
      schema: { response: { 200: yup.array().of(yup.object(getAllRes)) } },
    },
    async () => service.getAll(),
  );

  fastify.get<{ Params: BodyOrParams }>(
    '/:name',
    {
      schema: { response: { 200: yup.object(getIdRes) } },
    },
    async (req) => service.getByName(req.params.name),
  );

  fastify.patch<{ Params: BodyOrParams; Body: BodyOrParams }>(
    '/:name',
    async (request) => {
      // we currently update only the cmd
      const { cmd } = request.body;
      const { name } = request.params;
      return service.updateCmd(name, cmd);
    },
  );

  fastify.delete<{ Params: BodyOrParams }>('/:name', async (request) => {
    const { name } = request.params;
    return service.deleteLanguage(name);
  });

  fastify.delete<{ Params: BodyOrParams }>(
    '/:name/:version',
    async ({ params }) => service.deleteVersion(params.name, params.version),
  );
}
