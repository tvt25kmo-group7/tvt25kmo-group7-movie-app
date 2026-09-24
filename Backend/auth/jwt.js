import jwt from 'jsonwebtoken';

const { sign, verify } = jwt;

function createToken(user) {
  return sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '15m',
    },
  );
}

function verifyToken(token) {
  return verify(token, process.env.JWT_SECRET_KEY);
}

function createRefreshToken(user) {
  return sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    },
  );
}

function verifyRefreshToken(token) {
  return verify(token, process.env.JWT_REFRESH_SECRET);
}

export {
  createToken,
  verifyToken,
  createRefreshToken,
  verifyRefreshToken,
};