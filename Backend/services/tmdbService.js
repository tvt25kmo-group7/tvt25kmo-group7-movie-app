const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const token = process.env.TMDB_API_TOKEN;
const SUPPORTED_MEDIA_TYPES = ["movie", "tv"];

//normalize the search result into the application's unified data format
function normalizeSearchResult(result) {
  const isMovie = result.media_type === "movie";

  // Determine if the result is a movie or a TV show
  return {
    tmdbId: result.id,
    mediaType: result.media_type,
    title: isMovie ? result.title : result.name,
    releaseDate: isMovie
      ? result.release_date || null
      : result.first_air_date || null,
    overview: result.overview || "",
    posterPath: result.poster_path || null,
    voteAverage: result.vote_average ?? null, // "nullish coalescing operator", returns null if result.vote_average is undefined or null
  };
}

//search for movies and TV shows using the TMDB API
async function searchMoviesAndTv(query, page = 1) {
  // Construct the search URL with query parameters
  const searchParams = new URLSearchParams({
    query,
    page: String(page),
    language: "en-US",
  });

  // Construct the full search URL for the TMDB API
  const url = `${TMDB_BASE_URL}/search/multi?${searchParams.toString()}`;

  // Send the search request to the TMDB API
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`, // Use the TMDB API Bearer token for authentication
    },
  });

  // Check if the response from the TMDB API is successful
  if (!response.ok) {
    throw new Error(`TMDB API request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Ensure that the results array exists and is an array before processing
  if (!Array.isArray(data.results)) {
    throw new Error("TMDB response did not contain a results array");
  }

  // Filter out unsupported media types and normalize the remaining results
  const results = data.results
    .filter((result) => SUPPORTED_MEDIA_TYPES.includes(result.media_type))
    .map(normalizeSearchResult); // normalize the search results after filtering

  // Return the paginated search results along with metadata
  return {
    page: data.page,
    totalPages: data.total_pages,
    displayedResults: results.length,
    results,
  };
}

// Fetch movies that are currently playing in Finnish cinemas using the TMDB API
async function getNowPlayingMovies(page = 1) {
  // Read the TMDB API token from the environment
  const token = process.env.TMDB_API_TOKEN;

  // Construct the request parameters for the TMDB API request
  const searchParams = new URLSearchParams({
    region: "FI",
    language: "fi-FI",
    page: String(page),
  });

  // Construct the full request URL
  const url = `${TMDB_BASE_URL}/movie/now_playing?${searchParams.toString()}`;

  // Send the now-playing request to the TMDB API
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  // Check if the response from the TMDB API is successful
  if (!response.ok) {
    throw new Error(`TMDB API request failed with status ${response.status}`);
  }

  // Parse the JSON response from the TMDB API
  const data = await response.json();

  // Ensure that the results array exists and is an array before processing
  if (!Array.isArray(data.results)) {
    throw new Error("TMDB response did not contain a results array");
  }

  // Return the paginated results along with metadata
  return {
    page: data.page,
    totalPages: data.total_pages,
    displayedResults: data.results.length,
    results: data.results.map((result) =>
      normalizeSearchResult({
        ...result,
        media_type: "movie",
      })
    ),
  };
}

async function searchMoviesAndTvCriteria(query, page = 1) {
  const { genre, mediaType, year, yearFrom, yearTo } = query;
  const startYear = yearFrom ?? year;
  const endYear = yearTo ?? year;

  if (!genre && !mediaType && !startYear && !endYear) {
    throw new Error("At least one search criterion is required");
  }

  if (
    genre !== undefined &&
    (!Number.isInteger(Number(genre)) || Number(genre) < 1)
  ) {
    throw new Error("Genre must be a positive integer");
  }

  if (mediaType !== undefined && !SUPPORTED_MEDIA_TYPES.includes(mediaType)) {
    throw new Error("Media type must be movie or tv");
  }

  for (const selectedYear of [startYear, endYear]) {
    if (
      selectedYear !== undefined &&
      (!/^\d{4}$/.test(String(selectedYear)) || Number(selectedYear) < 1878)
    ) {
      throw new Error("Years must be valid four-digit years");
    }
  }

  if (
    startYear !== undefined &&
    endYear !== undefined &&
    Number(startYear) > Number(endYear)
  ) {
    throw new Error("yearFrom cannot be later than yearTo");
  }

  const mediaTypes = mediaType ? [mediaType] : SUPPORTED_MEDIA_TYPES;
  const results = [];
  let totalPages = 0;

  for (const currentMediaType of mediaTypes) {
    const searchParams = new URLSearchParams({
      page: String(page),
      language: "en-US",
      sort_by: "popularity.desc",
    });

    if (genre) {
      searchParams.set("with_genres", String(genre));
    }

    const dateParameter =
      currentMediaType === "movie" ? "primary_release_date" : "first_air_date";

    if (startYear !== undefined) {
      searchParams.set(`${dateParameter}.gte`, `${startYear}-01-01`);
    }

    if (endYear !== undefined) {
      searchParams.set(`${dateParameter}.lte`, `${endYear}-12-31`);
    }

    const url = `${TMDB_BASE_URL}/discover/${currentMediaType}?${searchParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.results)) {
      throw new Error("TMDB response did not contain a results array");
    }

    totalPages = Math.max(totalPages, data.total_pages ?? 0);
    results.push(
      ...data.results.map((result) =>
        normalizeSearchResult({ ...result, media_type: currentMediaType }),
      ),
    );
  }

  return {
    page,
    totalPages,
    displayedResults: results.length,
    results,
  };
}

//This part is for favorite routes, to get the media by id and media type from TMDB API
async function getMoviesById(tmdbId, mediaType) {
  const url =
    `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?language=en-US`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `TMDB API request failed with status ${response.status}`,
    );
  }

  const data = await response.json();

  return normalizeSearchResult({
    ...data,
    media_type: mediaType,
  });
}

export { getNowPlayingMovies, searchMoviesAndTv, searchMoviesAndTvCriteria, getMoviesById };