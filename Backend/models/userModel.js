import { database } from '../services/database.js';

// Finds an existing account by email for login and registration checks.
async function findUserByEmail(email) {
  const result = await database.query(
    `
      SELECT id, email, username, password_hash
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

// Finds an existing account by username during registration.
async function findUserByUsername(username) {
  const result = await pool.query(
    `
      SELECT id, email, username
      FROM users
      WHERE username = $1
    `,
    [username]
  );

  return result.rows[0] || null;
}

// Inserts a new account using parameters to keep user input separate from SQL.
async function createUser(email, username, passwordHash) {
  const result = await pool.query(
    `
      INSERT INTO users (email, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, username
    `,
    [email, username, passwordHash]
  );

  return result.rows[0] || null;
}

export { findUserByEmail, findUserByUsername, createUser };