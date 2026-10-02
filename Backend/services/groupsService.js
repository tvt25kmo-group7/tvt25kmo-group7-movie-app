/*
Creates the group in the DB
Adds the owner to group_members
Runs both queries in one transaction
Uses parameterized SQL queries
*/
import { database } from '../services/database.js';
import { insertGroup, insertGroupMember, getAllGroups, getGroupById, insertGroupMedia, getGroupMediaByGroupId, getGroupsByUserId, insertJoinRequest } from '../models/groupModel.js';
import { getMoviesById } from './tmdbService.js';

async function createGroup(name, ownerId) {
  const client = await database.connect();

  try {
    await client.query('BEGIN');

    const group = await insertGroup(client, name, ownerId);
    await insertGroupMember(client, group.id, ownerId);

    await client.query('COMMIT');

    return group;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getGroups() {
  return getAllGroups();
}

async function getUserGroups(userId) {
  return getGroupsByUserId(userId);
}

async function getGroup(groupId, userId = null) {
  const group = await getGroupById(groupId, userId);

  if (!group) {
    return null;
  }

  if (!group.isOwner && group.membershipStatus !== 'member') {
    return {
      ...group,
      media: [],
    };
  }

  const storedMedia = await getGroupMediaByGroupId(groupId);

  const media = await Promise.all(
    storedMedia.map(async (item) => {
      const details = await getMoviesById(
        item.tmdbId,
        item.mediaType,
      );

      return {
        ...details,
        addedBy: item.addedBy,
        addedAt: item.createdAt,
      };
    }),
  );

  return {
    ...group,
    media,
  };
}

async function addMediaToGroup(groupId, tmdbId, mediaType, userId) {
  const group = await getGroupById(groupId, userId);

  if (!group) {
    return {
      error: 'groupNotFound',
    };
  }

  if (!group.isOwner && group.membershipStatus !== 'member') {
    return {
      error: 'notMember',
    };
  }

  const media = await insertGroupMedia(
    groupId,
    tmdbId,
    mediaType,
    userId,
  );

  return {
    media,
  };
}

async function requestGroupMembership(groupId, userId) {
  const group = await getGroupById(groupId, userId);

  if (!group) {
    return {
      error: 'groupNotFound',
    };
  }

  if (group.isOwner || group.membershipStatus === 'member') {
    return {
      error: 'alreadyMember',
    };
  }

  if (group.membershipStatus === 'pending') {
    return {
      error: 'requestPending',
    };
  }

  if (group.membershipStatus === 'invited') {
    return {
      error: 'alreadyInvited',
    };
  }

  const request = await insertJoinRequest(groupId, userId);

  return {
    request,
  };
}

export { createGroup, getGroups, getGroup, addMediaToGroup, getUserGroups, requestGroupMembership };