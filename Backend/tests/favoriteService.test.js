//this test is totally AI-generated, and it is not guaranteed to be correct. Please review the test before running it.
import "dotenv/config";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { database } from "../services/database.js";
import favoriteService from "../services/favoriteService.js";

const userId = Number(process.env.FAVORITE_TEST_USER_ID);
const tmdbId = Number(process.env.FAVORITE_TEST_TMDB_ID ?? 550);
const mediaType = "movie";

before(async () => {
  assert.ok(
    Number.isInteger(userId) && userId > 0,
    "Set FAVORITE_TEST_USER_ID to an existing database user id",
  );
  assert.ok(Number.isInteger(tmdbId) && tmdbId > 0, "TMDB id must be positive");

  const userResult = await database.query(
    "SELECT id FROM users WHERE id = $1",
    [userId],
  );

  assert.equal(
    userResult.rowCount,
    1,
    `No user found with id ${userId}`,
  );

  await database.query(
    `
      DELETE FROM favorites
      WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3
    `,
    [userId, tmdbId, mediaType],
  );
});

after(async () => {
  await database.query(
    `
      DELETE FROM favorites
      WHERE user_id = $1 AND tmdb_id = $2 AND media_type = $3
    `,
    [userId, tmdbId, mediaType],
  );

  await database.end();
});

test("adds a favorite and rejects the same favorite as a duplicate", async () => {
  const firstResult = await favoriteService.addFavorite(
    userId,
    tmdbId,
    mediaType,
  );

  assert.equal(firstResult.alreadyExists, false);
  assert.equal(firstResult.favorite.tmdbId, tmdbId);
  assert.equal(firstResult.favorite.mediaType, mediaType);

  const duplicateResult = await favoriteService.addFavorite(
    userId,
    tmdbId,
    mediaType,
  );

  assert.equal(duplicateResult.alreadyExists, true);
  assert.equal(duplicateResult.favorite, null);
});
