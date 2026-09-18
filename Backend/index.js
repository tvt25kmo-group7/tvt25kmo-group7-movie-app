import "dotenv/config";
import http from 'node:http';

import { handleHealthRoute } from './routes/healthRoutes.js';
import { handleMovieRoutes } from './routes/movieRoutes.js';
import { handleFavoriteRoutes } from './routes/favoriteRoutes.js';
import { handleSearchRoute } from "./routes/searchRoutes.js";
import { handleUserRoutes } from './routes/userRoutes.js';
import { database } from './services/database.js';

if (!process.env.TMDB_API_TOKEN) {
  throw new Error("TMDB_API_TOKEN is not configured");
}

const port = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (await handleUserRoutes(req, res, database)) {
    return;
  }

  if (await handleMovieRoutes(req, res)) {
    return;
  }

  if (await handleFavoriteRoutes(req, res)) {
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