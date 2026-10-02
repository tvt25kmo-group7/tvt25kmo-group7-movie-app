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
import { createGroup, getGroup, getGroups, addMediaToGroup, getUserGroups, requestGroupMembership, getGroupJoinRequests, approveGroupJoinRequest, rejectGroupJoinRequest } from '../services/groupsService.js';

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

  const mediaMatch = requestUrl.pathname.match(
    /^\/api\/groups\/(\d+)\/media$/,
  );

  const joinRequestMatch = requestUrl.pathname.match(
    /^\/api\/groups\/(\d+)\/join-requests$/,
  );

  const joinRequestUserMatch = requestUrl.pathname.match(
    /^\/api\/groups\/(\d+)\/join-requests\/(\d+)$/,
  );

  if (requestUrl.pathname === '/api/groups/mine') {
    if (req.method !== 'GET') {
      sendJson(
        res,
        405,
        { error: 'Method not allowed' },
        { Allow: 'GET' },
      );
      return true;
    }

    if (!authenticateRequest(req, res, { recycleToken: false })) {
      return true;
    }

    try {
      const groups = await getUserGroups(req.user.id);
      sendJson(res, 200, groups);
    } catch (error) {
      console.error('Fetching user groups failed:', error);
      sendJson(res, 500, {
        error: 'User groups could not be loaded',
      });
    }

    return true;
  }

  if (joinRequestUserMatch) {
    if (!['PATCH', 'DELETE'].includes(req.method)) {
      sendJson(
        res,
        405,
        { error: 'Method not allowed' },
        { Allow: 'PATCH, DELETE' },
      );
      return true;
    }

    if (!authenticateRequest(req, res, { recycleToken: false })) {
      return true;
    }

    const groupId = Number(joinRequestUserMatch[1]);
    const requestedUserId = Number(joinRequestUserMatch[2]);

    if (!Number.isInteger(requestedUserId) || requestedUserId < 1) {
      sendJson(res, 400, {
        error: 'userId must be a positive integer',
      });
      return true;
    }

    try {
      const result =
        req.method === 'PATCH' ?
          await approveGroupJoinRequest(
            groupId,
            requestedUserId,
            req.user.id,
          )
        : await rejectGroupJoinRequest(
            groupId,
            requestedUserId,
            req.user.id,
          );

      if (result.error === 'groupNotFound') {
        sendJson(res, 404, { error: 'Group not found' });
        return true;
      }

      if (result.error === 'notOwner') {
        sendJson(res, 403, {
          error: 'Only the group owner can manage join requests',
        });
        return true;
      }

      if (result.error === 'requestNotFound') {
        sendJson(res, 404, {
          error: 'Pending join request not found',
        });
        return true;
      }

      if (req.method === 'PATCH') {
        sendJson(res, 200, result.membership);
        return true;
      }

      sendJson(res, 200, {
        message: 'Join request rejected',
        request: result.request,
      });
    } catch (error) {
      console.error('Managing group join request failed:', error);
      sendJson(res, 500, {
        error: 'Group join request could not be managed',
      });
    }

    return true;
  }

  if (joinRequestMatch) {
    if (!['GET', 'POST'].includes(req.method)) {
      sendJson(
        res,
        405,
        { error: 'Method not allowed' },
        { Allow: 'GET, POST' },
      );
      return true;
    }

    if (!authenticateRequest(req, res, { recycleToken: false })) {
      return true;
    }

    const groupId = Number(joinRequestMatch[1]);

    if (req.method === 'GET') {
      try {
        const result = await getGroupJoinRequests(
          groupId,
          req.user.id,
        );

        if (result.error === 'groupNotFound') {
          sendJson(res, 404, { error: 'Group not found' });
          return true;
        }

        if (result.error === 'notOwner') {
          sendJson(res, 403, {
            error: 'Only the group owner can view join requests',
          });
          return true;
        }

        sendJson(res, 200, result.requests);
      } catch (error) {
        console.error('Fetching group join requests failed:', error);
        sendJson(res, 500, {
          error: 'Group join requests could not be loaded',
        });
      }

      return true;
    }

    try {
      const result = await requestGroupMembership(
        groupId,
        req.user.id,
      );

      if (result.error === 'groupNotFound') {
        sendJson(res, 404, { error: 'Group not found' });
        return true;
      }

      if (result.error === 'alreadyMember') {
        sendJson(res, 409, {
          error: 'You are already a member of this group',
        });
        return true;
      }

      if (result.error === 'requestPending') {
        sendJson(res, 409, {
          error: 'Your request to join this group is already pending',
        });
        return true;
      }

      if (result.error === 'alreadyInvited') {
        sendJson(res, 409, {
          error: 'You already have an invitation to this group',
        });
        return true;
      }

      sendJson(res, 201, result.request);
    } catch (error) {
      if (error.code === '23505') {
        sendJson(res, 409, {
          error: 'A membership or join request already exists',
        });
        return true;
      }

      console.error('Creating group join request failed:', error);
      sendJson(res, 500, {
        error: 'Group join request could not be created',
      });
    }

    return true;
  }

  if (mediaMatch) {
    if (req.method !== 'POST') {
      sendJson(
        res,
        405,
        { error: 'Method not allowed' },
        { Allow: 'POST' },
      );
      return true;
    }

    if (!authenticateRequest(req, res)) {
      return true;
    }

    const groupId = Number(mediaMatch[1]);

    try {
      const body = await readJsonBody(req);
      const { tmdbId, mediaType } = body;

      if (!Number.isInteger(tmdbId) || tmdbId < 1) {
        sendJson(res, 400, {
          error: 'tmdbId must be a positive integer',
        });
        return true;
      }

      if (!['movie', 'tv'].includes(mediaType)) {
        sendJson(res, 400, {
          error: 'mediaType must be movie or tv',
        });
        return true;
      }

      const result = await addMediaToGroup(
        groupId,
        tmdbId,
        mediaType,
        req.user.id,
      );

      if (result.error === 'groupNotFound') {
        sendJson(res, 404, { error: 'Group not found' });
        return true;
      }

      if (result.error === 'notMember') {
        sendJson(res, 403, {
          error: 'Only group members can add media',
        });
        return true;
      }

      sendJson(res, 201, result.media);
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(res, 400, { error: 'Invalid request body' });
        return true;
      }

      if (error.code === '23505') {
        sendJson(res, 409, {
          error: 'This movie or series is already in the group',
        });
        return true;
      }

      console.error('Adding media to group failed:', error);
      sendJson(res, 500, {
        error: 'Media could not be added to the group',
      });
    }

    return true;
  }

  if (match && req.method === 'GET') {
    if (!authenticateOptionalRequest(req, res, { recycleToken: false })) {
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