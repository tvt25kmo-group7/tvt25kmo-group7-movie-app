import { authenticateRequest } from '../auth/auth.js';
import { loginUser,registerUser,refreshAccessToken } from '../services/authService.js';
import { deleteUserById } from '../services/userService.js';
import { clearRefreshToken,findUserById } from '../models/userModel.js';
import { createToken } from '../auth/jwt.js';

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

function createRefreshCookie(refreshToken) {
  return [
    `refreshToken=${refreshToken}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api/users',
    'Max-Age=604800',
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ');
}

function getRefreshTokenFromCookie(req) {
  const cookies = req.headers.cookie?.split(';') ?? [];

  const refreshCookie = cookies
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('refreshToken='));

  return refreshCookie
    ? refreshCookie.slice('refreshToken='.length)
    : null;
}

function createClearRefreshCookie() {
  return [
    'refreshToken=',
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api/users',
    'Max-Age=0',
    ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
  ].join('; ');
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

  if (url.pathname === '/api/users/refresh') {
    return handleRefresh(req, res);
  }

  if (url.pathname === '/api/users/logout') {
    return handleLogout(req, res);
  }

  if (url.pathname === '/api/users/me') {
    if (req.method === 'GET') {
      return handleGetMe(req, res);
    }

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

    const session = await loginUser(email, password);

    if (!session) {
      sendJson(res, 401, {
        error: 'Invalid email or password',
      });

      return true;
    }

    sendJson(res, 200, session.user, {
      'Set-Cookie': createRefreshCookie(session.refreshToken),
    });

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

async function handleRefresh(req, res) {
  if (req.method !== 'POST') {
    sendJson(
      res,
      405,
      { error: 'This action requires a POST request' },
      { Allow: 'POST' },
    );

    return true;
  }

  const refreshToken = getRefreshTokenFromCookie(req);

  if (!refreshToken) {
    sendJson(res, 401, {
      error: 'Refresh token required',
    });

    return true;
  }

  try {
    const user = await refreshAccessToken(refreshToken);

    if (!user) {
      sendJson(res, 401, {
        error: 'Invalid or expired refresh token',
      });

      return true;
    }

    sendJson(res, 200, user);

    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);

    sendJson(res, 500, {
      error: 'Unable to refresh token',
    });

    return true;
  }
}

async function handleGetMe(req, res) {
  if (!authenticateRequest(req, res, { recycleToken: false })) {
    return true;
  }

  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      sendJson(res, 404, {
        error: 'User account not found',
      });

      return true;
    }

    res.setHeader('Authorization', `Bearer ${createToken(user)}`);

    sendJson(res, 200, user);

    return true;
  } catch (error) {
    console.error('User lookup failed:', error);

    sendJson(res, 500, {
      error: 'Unable to retrieve user information',
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

  if (!authenticateRequest(req, res, { recycleToken: false })) {
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

    const newUser = await registerUser(email, username, password);

    sendJson(res, 201, {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

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

async function handleLogout(req, res) {
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
    const refreshToken = getRefreshTokenFromCookie(req);

    if (refreshToken) {
      await clearRefreshToken(refreshToken);
    }

    sendJson(
      res,
      200,
      { message: 'Logged out successfully' },
      { 'Set-Cookie': createClearRefreshCookie() },
    );

    return true;
  } catch (error) {
    console.error('Logout failed:', error);

    sendJson(res, 500, {
      error: 'Something went wrong while signing out',
    });

    return true;
  }
}

export { handleUserRoutes, handleRegisterRoute };