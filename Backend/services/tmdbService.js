const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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
    const token = process.env.TMDB_API_TOKEN;

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
            Authorization: `Bearer ${token}`,   // Use the TMDB API Bearer token for authentication
        },
    });

    // Check if the response from the TMDB API is successful
    if (!response.ok) {
        throw new Error(`TMDB API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Ensure that the results array exists and is an array before processing
    if (!Array.isArray(data.results)) {
        throw new Error(
            "TMDB response did not contain a results array"
        );
    }
    
    // Filter out unsupported media types and normalize the remaining results
    const results = data.results
        .filter(result => 
            SUPPORTED_MEDIA_TYPES.includes(result.media_type)
        )
        .map(normalizeSearchResult); // normalize the search results after filtering

    // Return the paginated search results along with metadata
    return {
        page: data.page,
        totalPages: data.total_pages,
        displayedResults: results.length,
        results,
    };
}

//nowplayingmovies is for fetching the list of movies that are currently playing in finnish theaters
async function getNowPlayingMovies() {
    const url =
        'https://api.themoviedb.org/3/movie/now_playing' +
        '?region=FI&language=fi-FI&page=1';

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
            accept: 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`TMDB request failed: ${response.status}`);
    }

    return response.json();
}

export { getNowPlayingMovies, searchMoviesAndTv };