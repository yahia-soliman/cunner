import Fastify from 'fastify';
import snippetRoute from './routes/snippet.route.js';
import languageRoute from './routes/language.route.js';
import authRoute from './routes/auth.route.js';
import { createAdmins } from './utils/admin.js';
import { jsonSchemaTransformer } from 'fastify-type-provider-yup';
import * as yupCompilers from './utils/yup-fastify-compilers.js';
import * as scalar from '@scalar/fastify-api-reference';
import fastifySwagger from '@fastify/swagger';
// import fastifySwaggerUi from '@fastify/swagger-ui';

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
      { name: 'Auth', description: 'Authentication and session management' },
      { name: 'Snippets', description: 'CRUD operations for code snippets' },
      { name: 'Languages', description: 'CRUD operations for languages' },
      {
        name: 'Admin',
        description: 'Requires the current logged in user to be an admin',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'To get a token, use the /auth/login endpoint',
        },
      },
    },
  },
});

await fastify.register(scalar.default, {
  routePrefix: '/doc',

  configuration: {
    metaData: {
      title: 'Cunner - Code Runner',
    },
    theme: 'kepler',
    defaultHttpClient: {
      targetKey: 'http',
      clientKey: 'http1.1',
    },
  },
});

// await fastify.register(fastifySwaggerUi, { routePrefix: 'swagger' });

await fastify.register(snippetRoute, { prefix: '/snippets' });
await fastify.register(languageRoute, { prefix: '/languages' });
await fastify.register(authRoute, { prefix: '/auth' });

fastify.addHook('onReady', async () => {
  fastify.swagger();
  await createAdmins();
});
await fastify.listen({ port: 3000 });
