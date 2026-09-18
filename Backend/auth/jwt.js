import jwt from "jsonwebtoken";
import { randomUUID } from 'node:crypto';

const { sign, verify } = jwt;

function createToken(user) {
  return sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1h",
      jwtid: randomUUID(),
    },
  );
}

function verifyToken(token) {
  return verify(token, process.env.JWT_SECRET_KEY);
}

export { createToken, verifyToken };
