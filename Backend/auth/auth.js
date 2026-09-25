import { createToken, verifyToken } from './jwt.js';

function authenticateRequest(req, res, { recycleToken = true } = {}) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Authentication required' }));
    return false;
  }

  const token = authorization.slice(7);

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    if (recycleToken) {
      const newToken = createToken(req.user);
      res.setHeader('Authorization', `Bearer ${newToken}`);
    }

    return true;
  } catch {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid or expired token' }));
    return false;
  }
}

export { authenticateRequest };