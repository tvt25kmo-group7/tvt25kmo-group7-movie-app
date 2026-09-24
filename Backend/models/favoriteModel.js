//This file contains functions to interact with the favorites table in the database. 
// It provides functions to get favorites by user ID and to add a favorite for a user.
//This page is not tested yet, but it is used in the favorite routes to get the 
// media by id and media type from TMDB API and also to add the media to the favorites table in the database.

import { database } from "../services/database.js";

async function getFavByUserId(userId) {
  const result = await database.query(

    `
        SELECT tmdb_id, media_type 
        FROM favorites WHERE user_id = $1 
        ORDER BY created_at DESC
    `,
    [userId], 
  );
  return result.rows;

}

async function addFavByUserId(userId, tmdbId, mediaType) {
  const result = await database.query(
    `
      INSERT INTO favorites (user_id, tmdb_id, media_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, media_type, tmdb_id)
      DO NOTHING
      RETURNING user_id, tmdb_id, media_type, created_at
    `,
    [userId, tmdbId, mediaType],
  );
  return result.rows[0] ?? null;
}

export { getFavByUserId, addFavByUserId };