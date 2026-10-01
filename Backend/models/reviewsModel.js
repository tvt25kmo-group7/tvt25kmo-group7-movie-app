//USERS CANT REMODEL THEIR REVIEWS OR DELETE THEM. HA HA HA SCREW YOU
import { database } from "../services/database.js";

// Fetches reviews for a movie/tv title along with the reviewer's username
async function getReviewsByMedia(mediaType, tmdbId) {
  const result = await database.query(
    `SELECT reviews.id, reviews.review_text, reviews.rating, reviews.created_at, users.username
     FROM reviews
     JOIN users ON users.id = reviews.user_id
     WHERE reviews.media_type = $1 AND reviews.tmdb_id = $2
     ORDER BY reviews.created_at DESC`,
    [mediaType, tmdbId],
  );

  return result.rows;
}


// Fetches every review a single user has written, across all titles
async function getReviewsByUser(userId) {
  const result = await database.query(
    `SELECT reviews.id, reviews.media_type, reviews.tmdb_id, reviews.review_text, reviews.rating, reviews.created_at
     FROM reviews
     WHERE reviews.user_id = $1
     ORDER BY reviews.created_at DESC`,
    [userId],
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

export { getReviewsByMedia, getReviewsByUser, postCreateReview };