import "dotenv/config";
import http from 'node:http';

import { handleHealthRoute } from './routes/healthRoutes.js';
import { handleMovieRoutes } from './routes/movieRoutes.js';
import { handleSearchRoute } from "./routes/searchRoutes.js";

if (!process.env.TMDB_API_TOKEN) {
  throw new Error("TMDB_API_TOKEN is not configured");
}

const port = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  if (await handleMovieRoutes(req, res)) {
    return;
  }

  if (await handleSearchRoute(req, res)) {
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