import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.addHook('onRequest', (request, reply, done) => {
  const [type, token] = request.headers.authorization?.split(' ') || [];
  if (type !== 'Bearer' || !token)
    reply.status(401).send();
  else done();
});

app.all('/', (request, reply) => {
  reply.send({ hello: 'World!' });
});

await app.listen({ port: 3000 });
