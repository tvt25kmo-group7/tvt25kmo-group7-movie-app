// Account deletion tests
import { deleteUserById } from '../services/userService.js';

function createTestPool({ rowCount = 1, deleteError = null } = {}) {
    const queries = [];

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
        wasRelease: () => released,
    };
};

describe('deleteUserById service', () => {
    test('returns true when the user is deleted', async () => {
        const { pool } = createTestPool();

        const deleted = await deleteUserById(42, pool);
       
        expect(deleted).toBe(true);
    });
});

describe('deleteUserById service', () => {
    test('deletes the user and commits teh transaction', async () => {
        const { pool, queries, wasReleased } = createTestPool();

        const deleted = await deleteUserById(42, pool);

        expect(deleted).toBe(true);
        expect(queries).toHaveLength(3);
        expect(queries[0].text).toBe(/BEGIN/);
        expect(queries[1].text).toContain('DELETE FROM users');
        expect(queries[1].text).toContain('$1');
        expect(queries[1].values).toEqual([42]);
        expect(queries[2].text).toBe(/COMMIT/);
        expect(wasReleased()).toBe(true);
    });

    test('returns false if user is not found', async () => {
        const { pool, queries, wasReleased } = createTestPool({ 
            rowCount: 0 });

        const deleted = await deleteUserById(42, pool);

        expect(deleted).toBe(false);
        expect(queries).toHaveLength(3);
        expect(queries[0].text).toBe(/BEGIN/);
        expect(queries[1].text).toContain('DELETE FROM users');
        expect(queries[2].text).toBe(/COMMIT/);
        expect(wasReleased()).toBe(true);
    });

    test('rolls back and releases the client if deletion fails', async () => {
        const { pool, queries, wasReleased } = createTestPool({ 
            deleteError: new Error('Database error') });

        await expect(deleteUserById(42, pool)).rejects.toThrow('dbError');

        expect(deleted).toBe(false);
        expect(queries).toHaveLength(3);
        expect(queries[0].text).toBe(/BEGIN/);
        expect(queries[1].text).toContain('DELETE FROM users');
        expect(queries[2].text).toBe(/ROLLBACK/);
        expect(wasReleased()).toBe(true);
    });

});