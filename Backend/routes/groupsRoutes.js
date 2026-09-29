/*
Handles routes and HTTP methods
Checks authentication
Reads the request body
Validates the group name
Sends HTTP responses
*/
import { authenticateRequest } from '../auth/auth.js';
import { sendJson } from '../helpers/sendJson.js';
import { createGroup } from '../services/groupsService.js';

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

  if (requestUrl.pathname !== '/api/groups') {
    return false;
  }

  if (req.method !== 'POST') {
    sendJson(
      res,
      405,
      { error: 'Only group creation is supported here' },
      { Allow: 'POST' },
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
      sendJson(res, 400, {
        error: 'Group name must contain 1-100 characters',
      });
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
