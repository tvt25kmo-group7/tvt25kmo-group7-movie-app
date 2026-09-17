export async function deleteUserById(userId, pool) {
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
