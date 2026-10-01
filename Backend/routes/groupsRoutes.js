/*
Handles routes and HTTP methods
Checks authentication
Reads the request body
Validates the group name
Sends HTTP responses
*/
import {
  authenticateRequest,
  authenticateOptionalRequest,
} from '../auth/auth.js';
import { sendJson } from '../helpers/sendJson.js';
import { createGroup, getGroup, getGroups } from '../services/groupsService.js';

async function readJsonBody(req) {
  let body = '';

  for await (const chunk of req) {
    body += chunk;
  }
  return JSON.parse(body);
}

export async function handleGroupsRoute(req, res) {
  const requestUrl = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`,
  );

  const match = requestUrl.pathname.match(/^\/api\/groups\/(\d+)$/);

  if (match && req.method === 'GET') {
    if (!authenticateOptionalRequest(req, res)) {
      return true;
    }

    const groupId = Number(match[1]);

    try {
      const group = await getGroup(groupId, req.user?.id);

      if (!group) {
        sendJson(res, 404, { error: 'Group not found' });
        return true;
      }
      sendJson(res, 200, group);
    } catch (error) {
      console.error('Fetching group failed:', error);
      sendJson(res, 500, { error: 'Group could not be loaded' });
    }
    return true;
  }

  if (requestUrl.pathname !== '/api/groups') {
    return false;
  }

  if (req.method === 'GET') {
    try {
      const groups = await getGroups();
      sendJson(res, 200, groups);
    } catch (error) {
      console.error('Fetching groups failed:', error);
      sendJson(res, 500, { error: 'Group list could not be loaded' });
    }
    return true;
  }

  if (req.method !== 'POST') {
    sendJson(
      res,
      405,
      { error: 'Only group browsing and creation are supported here' },
      { Allow: 'GET, POST' },
    );
    return true;
  }

  if (!authenticateRequest(req, res)) {
    return true;
  }

  try {
    const body = await readJsonBody(req);
    const name = body.name?.trim();

    if (!name || name.length > 100) {
      sendJson(res, 400, { error: 'Group name must contain 1-100 characters' });
      return true;
    }

    const group = await createGroup(name, req.user.id);

    sendJson(res, 201, group);
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { error: 'Invalid request body' });
      return true;
    }

    if (error.code === '23505') {
      sendJson(res, 409, {
        error: 'A group with this name already exists. Try a different name.',
      });
      return true;
    }

    console.error('Group creation failed:', error);
    sendJson(res, 500, { error: 'Group creation failed' });
  }
  return true;
}
