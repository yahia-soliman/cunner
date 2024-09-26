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
        'API to manage code snippets, run them, and inspect the output:\n\nThis API aims to provide an easy way to run your code snippets in a remote machine, without having to install anything. It provides an API for both the user to create, run, read, update, or delete snippets, and for the Admin of the application to support/unsupport different languages and versions.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    tags: [
      {
        name: 'Auth',
        description:
          'Authentication and session management:\n\nMost of the api end point requires authentication, to authenticate you need to `POST /auth/login` and you need an account to login with `POST /auth/register`\n\n**There is a special accout "The Admin"**\n\nIn the `.env` file you can specify the email and password for that account. this will allow you to manipulate the `/languages`',
      },
      {
        name: 'Languages',
        description:
          'Discover the available languages:\n\nThis two routes are puplic and does not require authentication',
      },
      {
        name: 'Snippets',
        description:
          'CRUD operations for code snippets:\n\nUsers can store, run, inspect their snippets.\n\n- **Requires Authentication**\n- **Requires the authenticated user to be the owner of the snippet**',
      },
      {
        name: 'Admin',
        description:
          'Admin can do everything mensioned above, in addition, they can manipulate the supported languages and versions by the application\n\n- **Requires Authentication**\n- **Requires the authenticated user to be an Admin**\n\nYou can specify the email and password for the admin in the `.env` file',
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
