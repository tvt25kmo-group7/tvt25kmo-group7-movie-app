import { getNowPlayingMovies } from '../services/tmdbService.js';

// Utility function to send JSON responses with appropriate headers and status codes
function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(JSON.stringify(body));
}

// Handles the /api/movies route for movies currently playing in Finnish cinemas
export async function handleMovieRoutes(req, res) {
  const requestUrl = new URL(
    req.url,
    `http://${req.headers.host || 'localhost'}`,
  );

  // This handler only handles the /api/movies path
  if (requestUrl.pathname !== '/api/movies') {
    return false;
  }

  // The path exists, but it only supports GET requests
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' }, { Allow: 'GET' });
    return true;
  }

  // Extract the page number from the request URL
  const page = Number(requestUrl.searchParams.get('page') ?? '1');

  // Validate the page number before proceeding
  if (!Number.isInteger(page) || page < 1) {
    sendJson(res, 400, { error: 'Page must be a positive integer' });
    return true;
  }

  // Fetch now-playing movies and handle any errors
  try {
    const movies = await getNowPlayingMovies(page);
    sendJson(res, 200, movies);
  } catch (error) {
    console.error('TMDB now-playing request failed:', error.message);
    sendJson(res, 502, {
      error: 'Now-playing movies are temporarily unavailable',
    });
  }

  return true;
}
