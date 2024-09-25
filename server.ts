import Fastify from 'fastify';
import snippetRoute from './routes/snippet.route.js';
import languageRoute from './routes/language.route.js';
import authRoute from './routes/auth.route.js';
import * as yupCompilers from './utils/yup-fastify-compilers.js';
import { createAdmins } from './utils/admin.js';

const fastify = Fastify({ logger: true });

// app.addHook('onRequest', (request, reply, done) => {
//   const [type, token] = request.headers.authorization?.split(' ') || [];
//   if (type !== 'Bearer' || !token)
//     reply.status(401).send();
//   else done();
// });

fastify.setValidatorCompiler(yupCompilers.validatorCompiler);
fastify.setSerializerCompiler(yupCompilers.serializerCompiler);

fastify.register(authRoute, { prefix: '/auth' });
fastify.register(snippetRoute, { prefix: '/snippets' });
fastify.register(languageRoute, { prefix: '/languages' });

fastify.addHook('onReady', createAdmins);
await fastify.listen({ port: 3000 });
