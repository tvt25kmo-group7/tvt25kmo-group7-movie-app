import http from 'node:http';
import { handleHealthRoute } from './routes/healthRoutes.js';
import { handleMovieRoutes } from './routes/movieRoutes.js';

const port = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  if (await handleMovieRoutes(req, res)) {
    return;
  }

  if (handleHealthRoute(req, res)) {
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});