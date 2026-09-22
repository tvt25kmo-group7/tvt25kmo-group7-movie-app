//This page is for favorite routes, to get the media by id and media type from TMDB API
//This page is not tested yet, but it is used in the favorite routes to get the media 
// by id and media type from TMDB API and also to add the media to the favorites table in the database.

import { getFavByUserId, addFavByUserId } from "../models/favoriteModel.js";
import { getMoviesById } from "./tmdbService.js";


async function getUserFavorites(userId) {
  const favorites = await getFavByUserId(userId);

  const results = await Promise.all(
    favorites.map((favorite) =>
      getMoviesById(
        favorite.tmdb_id,
        favorite.media_type,
      ),
    ),
  );

  return {
    displayedResults: results.length,
    results,
  };
}

async function addFavorite(userId, tmdbId, mediaType) {
  const favorite = await addFavByUserId(
    userId,
    tmdbId,
    mediaType,
  );

  if (!favorite) {
    return {
      alreadyExists: true,
      favorite: null,
    };
  }

  const movie = await getMoviesById(
    tmdbId,
    mediaType,
  );

    return {
    alreadyExists: false,
    favorite: movie,
  };
}

export default { getUserFavorites, addFavorite };