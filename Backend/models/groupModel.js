/*
Creates groups and group memberships in the db.
*/
import { database } from '../services/database.js';

async function insertGroup(client, name, ownerId) {
  const result = await client.query(
    `INSERT INTO groups (name, owner_id)
        VALUES ($1, $2)
        RETURNING id, name, owner_id, created_at`,
    [name, ownerId],
  );

  return result.rows[0];
}

async function insertGroupMember(client, groupId, userId) {
  await client.query(
    `INSERT INTO group_members (group_id, user_id, status)
        VALUES ($1, $2, 'member')`,
    [groupId, userId],
  );
}

async function getAllGroups() {
  const result = await database.query(
    `SELECT id, name 
    FROM groups 
    ORDER BY name ASC`,
  );
  return result.rows;
}

export { insertGroup, insertGroupMember, getAllGroups };
