import { loginUser, registerUser } from '../services/authService.js';


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

// Sends login and registration requests to the correct handler.
async function handleUserRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (await handleRegisterRoute(req, res, url)) {
    return true;
  }

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

// Handles account creation requests and sends the result to the client.
async function handleRegisterRoute(req, res, parsedUrl = new URL(req.url, `http://${req.headers.host}`)) {
  if (req.method === 'POST' && parsedUrl.pathname === '/api/users/register') {
    try {
      // Read the values sent by the client.
      const body = await readJsonBody(req);

      const { email, username, password } = body;

      if (!email || !username || !password) {
        res.writeHead(400, {
          'Content-Type': 'application/json',
        });

        res.end(
          JSON.stringify({
            error: 'Email, username, and password are required',
          }),
        );

        return true;
      }

      // The service validates the data, hashes the password, and creates the user.
      const user = await registerUser(email, username, password);

      res.writeHead(201, {
        'Content-Type': 'application/json',
      });

      res.end(JSON.stringify(user));

      return true;
    } catch (error) {
      console.error('Registration error:', error);

      const isConflict = error.message === 'Email is already registered'
        || error.message === 'Username is already taken';

      const isValidationError = error.message === 'Email, username, and password are required'
        || error.message === 'Invalid email address'
        || error.message.startsWith('Username must be')
        || error.message.startsWith('Password must be');
        
      const statusCode = isConflict ? 409 : isValidationError || error.message === 'Invalid JSON' ? 400 : 500;

      res.writeHead(statusCode, {
        'Content-Type': 'application/json',
      });

      res.end(
        JSON.stringify({
          error: statusCode === 500 ? 'Internal server error' : error.message,
        }),
      );

      return true;
    }
  }

  return false;
}
export { handleUserRoutes, handleRegisterRoute };