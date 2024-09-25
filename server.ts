import Fastify from 'fastify';
import snippetRoute from './routes/snippet.route.js';
import languageRoute from './routes/language.route.js';
import authRoute from './routes/auth.route.js';
import * as yupCompilers from './utils/yup-fastify-compilers.js';
import { createAdmins } from './utils/admin.js';
import ScalarApiReference from '@scalar/fastify-api-reference';
import fastifySwagger from '@fastify/swagger';
import { jsonSchemaTransformer } from 'fastify-type-provider-yup';

const fastify = Fastify({ logger: true });

fastify.setValidatorCompiler(yupCompilers.validatorCompiler);
fastify.setSerializerCompiler(yupCompilers.serializerCompiler);

await fastify.register(fastifySwagger, {
  transform: jsonSchemaTransformer,
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Cunner',
      version: '1.0.0',
      description:
        'API to manage code snippets, run them, and inspect the output',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      { name: 'auth', description: 'Authentication and session management' },
      { name: 'snippets', description: 'CRUD operations for code snippets' },
      { name: 'languages', description: 'CRUD operations for languages' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'UUID',
          description: 'To get a token, use the /auth/login endpoint',
        },
      },
    },
  },
});
fastify.get('/', async () => {
  return { status: 'ok' };
});
await fastify.register(ScalarApiReference, { routePrefix: '/doc' });

await fastify.register(snippetRoute, { prefix: '/snippets' });
await fastify.register(languageRoute, { prefix: '/languages' });
await fastify.register(authRoute, { prefix: '/auth' });

fastify.addHook('onReady', async () => {
  fastify.swagger();
  await createAdmins();
});
await fastify.listen({ port: 3000 });
