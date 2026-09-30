/*
Creates the group in the DB
Adds the owner to group_members
Runs both queries in one transaction
Uses parameterized SQL queries
*/
import { database } from '../services/database.js';
import { insertGroup, insertGroupMember, getAllGroups, getGroupById } from '../models/groupModel.js';

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

async function getGroup(groupId) {
  return getGroupById(groupId);
}

export { createGroup, getGroups, getGroup };