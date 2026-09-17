/**
 * Deletes a user account and all related data covered by the database
 * ON DELETE rules.
 *
 * Assumptions:
 * - The caller provides an authenticated user ID from req.user.id.
 * - A shared PostgreSQL pool is provided by the database setup task.
 * - Foreign keys remove related reviews, favourites, memberships, pending membership requests stored in group_members, and groupsowned by the user.
 * - group_media.added_by is set to NULL when applicable.
 *
 * @param {number} userId Authenticated user's database ID.
 * @param {import("pg").Pool} pool Shared PostgreSQL connection pool.
 * @returns {Promise<boolean>} True if the user was deleted, otherwise false.
 */

export async function deleteUserById(userId, pool) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new TypeError("User ID must be a positive integer");
  }

  if (!pool || typeof pool.connect !== "function") {
    throw new TypeError("A PostgreSQL connection pool is required");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM users
      WHERE id = $1
      RETURNING id`,
      [userId],
    );

    await client.query("COMMIT");
    return result.rowCount === 1;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
