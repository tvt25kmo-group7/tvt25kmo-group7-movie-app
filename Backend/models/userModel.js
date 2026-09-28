import { database } from '../services/database.js';

async function findUserByEmail(email) {
  const result = await database.query(
    `
      SELECT id, email, username, password_hash
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  return result.rows[0] || null;
}

async function findUserByUsername(username) {
  const result = await database.query(
    `
      SELECT id, email, username
      FROM users
      WHERE username = $1
    `,
    [username],
  );

  return result.rows[0] || null;
}

async function createUser(email, username, passwordHash) {
  const result = await database.query(
    `
      INSERT INTO users (email, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, username
    `,
    [email, username, passwordHash],
  );

  return result.rows[0] || null;
}

async function saveRefreshToken(userId, refreshToken) {
  await database.query(
    `
      UPDATE users
      SET refresh_token = $1
      WHERE id = $2
    `,
    [refreshToken, userId],
  );
}

async function findUserByRefreshToken(refreshToken) {
  const result = await database.query(
    `
      SELECT id, email, username
      FROM users
      WHERE refresh_token = $1
    `,
    [refreshToken],
  );

  return result.rows[0] || null;
}

async function clearRefreshToken(refreshToken) {
  await database.query(
    `
      UPDATE users
      SET refresh_token = NULL
      WHERE refresh_token = $1
    `,
    [refreshToken],
  );
}

async function findUserById(userId) {
  const result = await database.query(
    `
      SELECT id, email, username
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  return result.rows[0] || null;
}

export {
  findUserByEmail,
  findUserByUsername,
  createUser,
  saveRefreshToken,
  findUserByRefreshToken,
  clearRefreshToken,
  findUserById,
};
