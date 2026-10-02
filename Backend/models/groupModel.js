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
      COALESCE(groups.owner_id = $2, false) AS "isOwner",
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

async function insertGroupMedia(groupId, tmdbId, mediaType, addedBy) {
  const result = await database.query(
    `INSERT INTO group_media (
      group_id,
      tmdb_id,
      media_type,
      added_by
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      group_id AS "groupId",
      tmdb_id AS "tmdbId",
      media_type AS "mediaType",
      added_by AS "addedBy",
      created_at AS "createdAt"`,
    [groupId, tmdbId, mediaType, addedBy],
  );

  return result.rows[0];
}

async function getGroupMediaByGroupId(groupId) {
  const result = await database.query(
    `SELECT
      tmdb_id AS "tmdbId",
      media_type AS "mediaType",
      added_by AS "addedBy",
      created_at AS "createdAt"
    FROM group_media
    WHERE group_id = $1
    ORDER BY created_at DESC`,
    [groupId],
  );

  return result.rows;
}

async function getGroupsByUserId(userId) {
  const result = await database.query(
    `SELECT
      groups.id,
      groups.name
    FROM groups
    JOIN group_members
      ON group_members.group_id = groups.id
    WHERE group_members.user_id = $1
      AND group_members.status = 'member'
    ORDER BY groups.name ASC`,
    [userId],
  );

  return result.rows;
}

async function insertJoinRequest(groupId, userId) {
  const result = await database.query(
    `INSERT INTO group_members (
      group_id,
      user_id,
      status
    )
    VALUES ($1, $2, 'pending')
    RETURNING
      group_id AS "groupId",
      user_id AS "userId",
      status,
      joined_at AS "requestedAt"`,
    [groupId, userId],
  );

  return result.rows[0];
}

export { insertGroup, insertGroupMember, getAllGroups, getGroupById, insertGroupMedia, getGroupMediaByGroupId, getGroupsByUserId, insertJoinRequest };
