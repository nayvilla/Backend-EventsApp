// server.js
const fastify = require('fastify')({ logger: true });
fastify.register(require('@fastify/formbody'));

fastify.register(require('./src/routes/events'));
fastify.register(require('./src/routes/users'));

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});
