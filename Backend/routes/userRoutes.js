// User authentication and account management routes.

import { authenticateRequest } from '../auth/auth.js';
import { loginUser, registerUser } from '../services/authService.js';
import { deleteUserById } from '../services/userService.js';
import { verifyToken } from '../auth/jwt.js';
import { revokeToken } from '../auth/tokenRevocation.js';

const MAX_BODY_BYTES = 1024 * 1024;

class RequestBodyError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'RequestBodyError';
    this.code = code;
  }
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });

  res.end(JSON.stringify(data));
}

function readJsonBody(req, maxSizeBytes = MAX_BODY_BYTES) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;

    req.on('data', chunk => {
      size += chunk.length;

      if (size > maxSizeBytes) {
        tooLarge = true;
        return;
      }

      chunks.push(chunk);
    });

    req.on('end', () => {
      if (tooLarge) {
        reject(
          new RequestBodyError(
            'PAYLOAD_TOO_LARGE',
            'The request body is too large',
          ),
        );

        return;
      }

      try {
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        const parsedBody = JSON.parse(rawBody);

        if (
          parsedBody === null ||
          typeof parsedBody !== 'object' ||
          Array.isArray(parsedBody)
        ) {
          throw new RequestBodyError(
            'INVALID_JSON',
            'The request body must be a JSON object',
          );
        }

        resolve(parsedBody);
      } catch (error) {
        if (error instanceof RequestBodyError) {
          reject(error);
          return;
        }

        reject(
          new RequestBodyError(
            'INVALID_JSON',
            'The request body is not valid JSON',
          ),
        );
      }
    });

    req.on('error', reject);
  });
}

async function handleUserRoutes(req, res, pool) {
  const url = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`,
  );

  if (url.pathname === '/api/users/login') {
    return handleLogin(req, res);
  }

  if (url.pathname === '/api/users/logout') {
    return handleLogout(req, res);
  }

  if (url.pathname === '/api/users/me') {
    return handleDeleteMe(req, res, pool);
  }

  if (url.pathname === '/api/users/register') {
    return handleRegisterRoute(req, res);
  }

  return false;
}

async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    sendJson(
      res,
      405,
      { error: 'This action requires a POST request' },
      { Allow: 'POST' },
    );

    return true;
  }

  try {
    const { email, password } = await readJsonBody(req);

    if (!email || !password) {
      sendJson(res, 400, {
        error: 'Email and password are required',
      });

      return true;
    }

    const user = await loginUser(email, password);

    if (!user) {
      sendJson(res, 401, {
        error: 'Invalid email or password',
      });

      return true;
    }

    sendJson(res, 200, user);

    return true;
  } catch (error) {
    if (error instanceof RequestBodyError) {
      const statusCode = error.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400;

      sendJson(res, statusCode, {
        error: error.message,
      });

      return true;
    }

    console.error('Login failed:', error);

    sendJson(res, 500, {
      error: 'Something went wrong while signing in',
    });

    return true;
  }
}

async function handleDeleteMe(req, res, pool) {
  if (req.method !== 'DELETE') {
    sendJson(
      res,
      405,
      { error: 'This action requires a DELETE request' },
      { Allow: 'DELETE' },
    );

    return true;
  }

  if (!authenticateRequest(req, res)) {
    return true;
  }

  try {
    const deleted = await deleteUserById(req.user.id, pool);

    if (!deleted) {
      sendJson(res, 404, {
        error: 'User account not found',
      });

      return true;
    }

    res.writeHead(204);
    res.end();

    return true;
  } catch (error) {
    console.error('Account deletion failed:', error);

    sendJson(res, 500, {
      error: 'Unable to delete the account',
    });

    return true;
  }
}

async function handleRegisterRoute(req, res) {
  if (req.method !== 'POST') {
    sendJson(
      res,
      405,
      { error: 'This action requires a POST request' },
      { Allow: 'POST' },
    );

    return true;
  }

  try {
    const { email, username, password } = await readJsonBody(req);

    if (!email || !username || !password) {
      sendJson(res, 400, {
        error: 'Email, username, and password are required',
      });

      return true;
    }

    const user = await registerUser(email, username, password);

    sendJson(res, 201, user);

    return true;
  } catch (error) {
    if (error instanceof RequestBodyError) {
      const statusCode = error.code === 'PAYLOAD_TOO_LARGE' ? 413 : 400;

      sendJson(res, statusCode, {
        error: error.message,
      });

      return true;
    }

    console.error('Registration error:', error);

    const isConflict = error.message === 'Email is already registered'
      || error.message === 'Username is already taken';
    const isValidationError = error.message === 'Email, username, and password are required'
      || error.message === 'Invalid email address'
      || error.message.startsWith('Username must be')
      || error.message.startsWith('Password must be');
    const statusCode = isConflict ? 409 : isValidationError ? 400 : 500;

    sendJson(res, statusCode, {
      error: statusCode === 500 ? 'Internal server error' : error.message,
    });

    return true;
  }
}

function handleLogout(req, res) {
  if (req.method !== 'POST') {
    sendJson(
      res,
      405,
      { error: 'This action requires a POST request' },
      { Allow: 'POST' },
    );

    return true;
  }

  if (!authenticateRequest(req, res)) {
    return true;
  }

  const token = req.headers.authorization.slice(7);
  const { exp } = verifyToken(token);

  revokeToken(token, exp);

  sendJson(res, 200, {
    message: 'Logged out successfully',
  });

  return true;
}

export { handleUserRoutes, handleRegisterRoute };