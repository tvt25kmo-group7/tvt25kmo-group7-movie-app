import 'dotenv/config';
import http from 'node:http';

import { handleHealthRoute } from './routes/healthRoutes.js';
import { handleMovieRoutes } from './routes/movieRoutes.js';
import { handleSearchRoute } from './routes/searchRoutes.js';
import { handleUserRoutes } from './routes/userRoutes.js';
import { handleFavoriteRoutes } from './routes/favoriteRoutes.js';
import { database } from './services/database.js';

function createServer(pool = database) {
  return http.createServer(async (req, res) => {
    try {

      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
      );

      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Expose-Headers', 'Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (await handleUserRoutes(req, res, pool)) {
        return;
      }

      if (await handleMovieRoutes(req, res)) {
        return;
      }

      if (await handleSearchRoute(req, res)) {
        return;
      }

      if (handleHealthRoute(req, res)) {
        return;
      }

      if (handleFavoriteRoutes(req, res)) {
        return;
      }

      res.writeHead(404, {
        'Content-Type': 'application/json',
      });

      res.end(
        JSON.stringify({
          error: 'Route not found',
        }),
      );
    } catch (error) {
      console.error('Unhandled request error:', error);

      if (!res.headersSent) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
      }

      res.end(
        JSON.stringify({
          error: 'Internal server error',
        }),
      );
    }
  });
}

const server = createServer();

export { createServer };
export default server;
