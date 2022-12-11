const http = require('http');

require('dotenv').config();

const app = require('./app');

const { mongoConnect } = require('./services/mongo');

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

// This is useful instead of using app.listen if we want to reuse
// the HTTP server, for example to run socket.io with the same
// HTTP server instance
const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
  });
}

startServer();
