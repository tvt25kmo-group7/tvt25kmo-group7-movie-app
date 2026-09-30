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

async function deleteUserById(userId, pool) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new TypeError('User ID must be a positive integer');
  }

  if (!pool || typeof pool.connect !== 'function') {
    throw new TypeError('A PostgreSQL connection pool is required');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `DELETE FROM users
      WHERE id = $1
      RETURNING id`,
      [userId],
    );

    await client.query('COMMIT');
    return result.rowCount === 1;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export {
  findUserByEmail,
  findUserByUsername,
  createUser,
  saveRefreshToken,
  findUserByRefreshToken,
  clearRefreshToken,
  findUserById,
  deleteUserById
};
