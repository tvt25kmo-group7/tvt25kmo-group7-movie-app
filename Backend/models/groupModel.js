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

async function getPendingJoinRequests(groupId) {
  const result = await database.query(
    `SELECT
      group_members.user_id AS "userId",
      users.username,
      group_members.joined_at AS "requestedAt"
    FROM group_members
    JOIN users
      ON users.id = group_members.user_id
    WHERE group_members.group_id = $1
      AND group_members.status = 'pending'
    ORDER BY group_members.joined_at ASC`,
    [groupId],
  );

  return result.rows;
}

async function approveJoinRequest(groupId, userId) {
  const result = await database.query(
    `UPDATE group_members
    SET
      status = 'member',
      joined_at = NOW()
    WHERE group_id = $1
      AND user_id = $2
      AND status = 'pending'
    RETURNING
      group_id AS "groupId",
      user_id AS "userId",
      status,
      joined_at AS "joinedAt"`,
    [groupId, userId],
  );

  return result.rows[0] ?? null;
}

async function rejectJoinRequest(groupId, userId) {
  const result = await database.query(
    `DELETE FROM group_members
    WHERE group_id = $1
      AND user_id = $2
      AND status = 'pending'
    RETURNING
      group_id AS "groupId",
      user_id AS "userId"`,
    [groupId, userId],
  );

  return result.rows[0] ?? null;
}

async function getGroupMembersByGroupId(groupId) {
  const result = await database.query(
    `SELECT
      group_members.user_id AS "userId",
      users.username,
      (groups.owner_id = group_members.user_id) AS "isOwner",
      group_members.joined_at AS "joinedAt"
    FROM group_members
    JOIN users
      ON users.id = group_members.user_id
    JOIN groups
      ON groups.id = group_members.group_id
    WHERE group_members.group_id = $1
      AND group_members.status = 'member'
    ORDER BY
      (groups.owner_id = group_members.user_id) DESC,
      users.username ASC`,
    [groupId],
  );

  return result.rows;
}

async function deleteGroupMember(groupId, userId) {
  const result = await database.query(
    `DELETE FROM group_members
    WHERE group_id = $1
      AND user_id = $2
      AND status = 'member'
      AND user_id <> (
        SELECT owner_id
        FROM groups
        WHERE id = $1
      )
    RETURNING
      group_id AS "groupId",
      user_id AS "userId"`,
    [groupId, userId],
  );

  return result.rows[0] ?? null;
}

async function deleteGroupById(groupId, ownerId) {
  const result = await database.query(
    `DELETE FROM groups
    WHERE id = $1
      AND owner_id = $2
    RETURNING
      id,
      name,
      owner_id AS "ownerId"`,
    [groupId, ownerId],
  );

  return result.rows[0] ?? null;
}

export { insertGroup, insertGroupMember, getAllGroups, getGroupById, insertGroupMedia, getGroupMediaByGroupId, getGroupsByUserId, insertJoinRequest, getPendingJoinRequests, approveJoinRequest, rejectJoinRequest, getGroupMembersByGroupId, deleteGroupMember, deleteGroupById };
