import { verifyToken } from './jwt.js';

function authenticateRequest(req, res) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Authentication required',
      }),
    );

    return false;
  }

  const token = authorization.slice(7);

  try {
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return true;
  } catch {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Invalid or expired token',
      }),
    );

    return false;
  }
}

export { authenticateRequest };