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

async function getGroupById(groupId, userId = null) {
  const result = await database.query(
    `SELECT 
      groups.id, 
      groups.name,
      COALESCE(groupId.owner_id = $2, false) AS "isOwner"
      group_members.status AS "membershipStatus"
    FROM groups
    LEFT JOIN group_members
      ON group_members.group_id = groups.id
      AND group_members.user_id = $2
    WHERE groups.id = $1`,
    [groupId, userId],
  );
  return result.rows[0] ?? null;
}

export { insertGroup, insertGroupMember, getAllGroups, getGroupById };
