import { loginUser } from '../services/authService.js';

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);
  });
}

async function handleUserRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/users/login') {
    try {
      const body = await readJsonBody(req);

      const { email, password } = body;

      if (!email || !password) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
        });

        res.end(
          JSON.stringify({
            error: 'Email and password are required',
          }),
        );

        return true;
      }

      const user = await loginUser(email, password);

      if (!user) {
        res.writeHead(401, {
          'Content-Type': 'application/json',
        });

        res.end(
          JSON.stringify({
            error: 'Invalid email or password',
          }),
        );

        return true;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
      });

      res.end(JSON.stringify(user));

      return true;
    } catch (error) {
        console.error('Login error:', error);

      res.writeHead(400, {
        'Content-Type': 'application/json',
      });

      res.end(
        JSON.stringify({
          error: 'Internal server error',
        }),
      );

      return true;
    }
  }

  return false;
}

export { handleUserRoutes };