import request from 'supertest';
import { createServer } from '../app.js';
import { createToken } from '../auth/jwt.js';
import { deleteUserById } from '../services/userService.js';

function createTestPool({ rowCount = 1, deleteError = null } = {}) {
  const queries = [];

  let released = false;

  const client = {
    async query(text, values) {
      queries.push({ text, values });

      if (text.includes('DELETE FROM users')) {
        if (deleteError) {
          throw deleteError;
        }

        return { rowCount };
      }

      return {};
    },

    release() {
      released = true;
    },
  };

  const pool = {
    async connect() {
      return client;
    },
  };

  return {
    pool,
    queries,
    wasReleased: () => released,
  };
}

describe('deleteUserById service', () => {
  test('deletes the user and commits teh transaction', async () => {
    const { pool, queries, wasReleased } = createTestPool();

    const deleted = await deleteUserById(42, pool);

    expect(deleted).toBe(true);
    expect(queries).toHaveLength(3);
    expect(queries[0].text).toBe('BEGIN');
    expect(queries[1].text).toContain('DELETE FROM users');
    expect(queries[1].text).toContain('$1');
    expect(queries[1].values).toEqual([42]);
    expect(queries[2].text).toBe('COMMIT');
    expect(wasReleased()).toBe(true);
  });

  test('returns false if user is not found', async () => {
    const { pool, queries, wasReleased } = createTestPool({
      rowCount: 0,
    });

    const deleted = await deleteUserById(42, pool);

    expect(deleted).toBe(false);
    expect(queries).toHaveLength(3);
    expect(queries[0].text).toBe('BEGIN');
    expect(queries[1].text).toContain('DELETE FROM users');
    expect(queries[2].text).toBe('COMMIT');
    expect(wasReleased()).toBe(true);
  });

  test('rolls back and releases the client if deletion fails', async () => {
    const { pool, queries, wasReleased } = createTestPool({
      deleteError: new Error('Database error'),
    });

    await expect(deleteUserById(42, pool)).rejects.toThrow('Database error');

    expect(queries).toHaveLength(3);
    expect(queries[0].text).toBe('BEGIN');
    expect(queries[1].text).toContain('DELETE FROM users');
    expect(queries[2].text).toBe('ROLLBACK');
    expect(wasReleased()).toBe(true);
  });

  test.each([0, -1, 1.5, '42', null, undefined])(
    'rejects invalid user ID: %s',
    async (userId) => {
      const { pool, queries, wasReleased } = createTestPool();

      await expect(deleteUserById(userId, pool)).rejects.toThrow(TypeError);

      expect(queries).toHaveLength(0);
      expect(wasReleased()).toBe(false);
    },
  );

  test.each([null, undefined, {}, { connect: 'not a function' }])(
    'rejects invalid db pool',
    async (invalidPool) => {
      await expect(deleteUserById(42, invalidPool)).rejects.toThrow(
        'A PostgreSQL connection pool is required',
      );
    },
  );
});

describe('DELETE /api/users/me', () => {
  test('returns 204 when the authenticated user is deleted', async () => {
    process.env.JWT_SECRET_KEY = 'account-del-test-key';

    const { pool } = createTestPool();
    const server = createServer(pool);
    const token = createToken({
      id: 42,
      email: 'user@example.com',
    });

    const response = await request(server)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });
});
