import { database } from "../services/database.js";

// Fetches reviews for a movie/tv title along with the reviewer's username
async function getReviewsByMedia(mediaType, tmdbId) {
  const result = await database.query(
    `SELECT reviews.review_text, reviews.rating, reviews.created_at, users.username
     FROM reviews
     JOIN users ON users.id = reviews.user_id
     WHERE reviews.media_type = $1 AND reviews.tmdb_id = $2
     ORDER BY reviews.created_at DESC`,
    [mediaType, tmdbId],
  );

  return result.rows;
}


async function postCreateReview(userId, mediaType, tmdbId, rating, reviewText){
  const result = await database.query(
    `INSERT INTO reviews (user_id, media_type, tmdb_id, rating, review_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, rating, review_text, created_at`,
    [userId, mediaType, tmdbId, rating, reviewText],
  );

  return result.rows[0];
}

export { getReviewsByMedia, postCreateReview };