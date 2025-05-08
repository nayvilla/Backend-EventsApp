const fs = require('fs');
const path = require('path');

module.exports = function (fastify, opts, done) {
  const usersPath = path.join(__dirname, '../data/users.json');
  const eventsPath = path.join(__dirname, '../data/events.json');

  const getUsers = () => JSON.parse(fs.readFileSync(usersPath));
  const saveUsers = (data) => fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));

  const getEvents = () => JSON.parse(fs.readFileSync(eventsPath));

  // Registro de usuario
  fastify.post('/api/users/register', (req, reply) => {
    const users = getUsers();
    const lastId = users.length ? Math.max(...users.map(u => u.id)) : 0;
    const newUser = {
      id: lastId + 1,
      nombre: req.body.nombre,
      email: req.body.email,
      password: req.body.password,
      favorites: []
    };
    users.push(newUser);
    saveUsers(users);
    reply.code(201).send(newUser);
  });

  // Inicio de sesión
  fastify.post('/api/users/login', (req, reply) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return reply.code(401).send({ error: 'Credenciales incorrectas' });
    reply.send(user);
  });

  // Obtener favoritos de un usuario
  fastify.get('/api/users/:id/favorites', (req, reply) => {
    const users = getUsers();
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' });

    const events = getEvents();
    const favoritos = events.filter(e => user.favorites.includes(e.id));
    reply.send(favoritos);
  });

  // Agregar evento a favoritos
  fastify.post('/api/users/:id/favorites', (req, reply) => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return reply.code(404).send({ error: 'Usuario no encontrado' });

    const { eventId } = req.body;
    if (!users[userIndex].favorites.includes(eventId)) {
      users[userIndex].favorites.push(eventId);
      saveUsers(users);
    }
    reply.send({ favorites: users[userIndex].favorites });
  });

  done();
};
