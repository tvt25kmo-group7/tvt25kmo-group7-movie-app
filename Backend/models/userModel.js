import pool from '../database.js';

async function findUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT id, email, username, password_hash
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export { findUserByEmail };