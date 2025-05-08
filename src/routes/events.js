const fs = require('fs');
const path = require('path');

module.exports = function (fastify, opts, done) {
  const filePath = path.join(__dirname, '../data/events.json');

  const getEvents = () => JSON.parse(fs.readFileSync(filePath));
  const saveEvents = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // Obtener todos los eventos o filtrar por categoría
  fastify.get('/api/events', (req, reply) => {
    const category = req.query.category;
    const events = getEvents();
    if (category) {
      const filtered = events.filter(e =>
        e.category.toLowerCase() === category.toLowerCase()
      );
      return reply.send(filtered);
    }
    reply.send(events);
  });

  // Obtener un evento específico por ID
  fastify.get('/api/events/:id', (req, reply) => {
    const events = getEvents();
    const event = events.find(e => e.id === parseInt(req.params.id));
    if (!event) return reply.code(404).send({ error: 'Evento no encontrado' });
    reply.send(event);
  });

  // Crear nuevo evento (solo admin)
  fastify.post('/api/events', (req, reply) => {
    const events = getEvents();
    const lastId = events.length ? Math.max(...events.map(e => e.id)) : 0;
    const newEvent = {
      id: lastId + 1,
      ...req.body
    };
    events.push(newEvent);
    saveEvents(events);
    reply.code(201).send(newEvent);
  });

  done();
};
