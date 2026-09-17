import 'dotenv/config';
import http from 'node:http';

import { handleHealthRoute } from './routes/healthRoutes.js';
import { handleMovieRoutes } from './routes/movieRoutes.js';
import { handleSearchRoute } from './routes/searchRoutes.js';
import { handleUserRoutes } from './routes/userRoutes.js';
import { database } from './services/database.js';

function createServer(pool = database) {
  return http.createServer(async (req, res) => {
    try {
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
