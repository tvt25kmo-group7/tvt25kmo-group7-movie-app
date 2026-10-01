import { createToken, verifyToken } from './jwt.js';

function sendAuthError(res, message) {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
}

function resolveUser(authorization) {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const decoded = verifyToken(authorization.slice(7));

  return { 
    id: decoded.id,
    email: decoded.email
  };
}

function authenticate(req, res, { required, recycleToken }) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    if (required) {
      sendAuthError(res, 'Authentication required');
      return false;
    }
    return true;
  }

  try {
    const user = resolveUser(authorization);

    if (!user) {
      sendAuthError(res, 'Invalid or expired token');
      return false;
    }

    req.user = user;

    if (recycleToken) {
      res.setHeader('Authorization', `Bearer ${createToken(user)}`);
    }

    return true;
  } catch {
    sendAuthError(res, 'Invalid or expired token');
    return false;
  }
}

function authenticateRequest(req, res, { recycleToken = true } = {}) {
  return authenticate(req, res, { required: true, recycleToken });
}

function authenticateOptionalRequest(req, res, { recycleToken = true } = {}) {
  return authenticate(req, res, { required: false, recycleToken });
}

export { authenticateRequest, authenticateOptionalRequest };