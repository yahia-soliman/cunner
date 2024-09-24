import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import * as service from '../services/language.js';
import { Language } from '../models/language.model.js';

interface BodyOrParams {
  name: string;
  version: string;
  versions: string[];
  cmd: string[];
}

const getAllResponseSchema = {
  name: { type: 'string' },
  versions: { type: 'array', items: { type: 'string' }, minItems: 1 },
};

const getAllOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: getAllResponseSchema,
        },
      },
    },
  },
};

const getByNameOpts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          ...getAllResponseSchema,
          created: { type: 'string' },
          updated: { type: 'string' },
        }
      },
    },
  },
};

const postBodySchema = {
  ...getAllResponseSchema,
  fileName: { type: 'string' },
  cmd: { type: 'array', items: { type: 'string' }, minItems: 1 },
};

const opts: RouteShorthandOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'versions', 'cmd'],
      properties: postBodySchema,
    },
    response: {
      200: {
        type: 'object',
        properties: postBodySchema,
      },
    },
  },
};

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
export default async function route(fastify: FastifyInstance) {
  fastify.post('/', opts, async (req) => {
    const { name, cmd, versions } = req.body as Language;
    return service.newLanguage({ name, cmd, versions });
  });

  fastify.post('/:name/:version', async (request) => {
    const { name, version } = request.params as BodyOrParams;
    return service.newVersion(name, version);
  });

  fastify.get('/', getAllOpts, async () => {
    return service.getAll();
  });

  fastify.get('/:name', getByNameOpts, async (request) => {
    const { name } = request.params as BodyOrParams;
    return service.getByName(name);
  });

  fastify.patch('/:name', async (request) => {
    // we currently update only the cmd
    const { cmd } = request.body as BodyOrParams;
    const { name } = request.params as { name: string };
    return service.updateCmd(name, cmd);
  });

  fastify.delete('/:name', async (request) => {
    const { name } = request.params as BodyOrParams;
    return service.deleteLanguage(name);
  });

  fastify.delete('/:name/:version', async (request) => {
    const { name, version } = request.params as BodyOrParams;
    return service.deleteVersion(name, version);
  });
}
