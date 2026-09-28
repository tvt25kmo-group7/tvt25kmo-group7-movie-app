import { getReviewsByMedia, postCreateReview} from "../models/reviewsModel.js";

// Validates the media reference and fetches its reviews with reviewer info
async function getMediaReviews(mediaType, tmdbId) {
  
  if (mediaType !== "movie" && mediaType !== "tv") {
    throw new Error("Media type must be 'movie' or 'tv'");
  }

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new Error("TMDB ID must be a positive integer");
  }

  return getReviewsByMedia(mediaType, tmdbId);
}


async function createReview(userId, mediaType, tmdbId, rating, reviewText){
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("User ID must be a positive integer");
  }
  
  if (mediaType !== "movie" && mediaType !== "tv") {
    throw new Error("Media type must be 'movie' or 'tv'");
  }


  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new Error("TMDB ID must be a positive number");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be a number between 1 and 5");
  }


  if (typeof reviewText !== "string" || reviewText.trim() === "") {
    throw new Error("Review text must be a non-empty string");
  }
  if (reviewText.length > 1000) {
    throw new Error("Review text must not exceed 1000 characters");
  }
  return postCreateReview(userId, mediaType, tmdbId, rating, reviewText);
}
export { getMediaReviews, createReview };