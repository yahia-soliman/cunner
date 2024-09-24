import Fastify from 'fastify';
import snippetRoute from './routes/snippet.route.js';
import languageRoute from './routes/language.route.js';

const fastify = Fastify({ logger: true });

// app.addHook('onRequest', (request, reply, done) => {
//   const [type, token] = request.headers.authorization?.split(' ') || [];
//   if (type !== 'Bearer' || !token)
//     reply.status(401).send();
//   else done();
// });

fastify.register(snippetRoute, { prefix: '/snippets' });
fastify.register(languageRoute, { prefix: '/languages' });


await fastify.listen({ port: 3000 });
