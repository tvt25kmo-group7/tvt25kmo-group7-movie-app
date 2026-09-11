import { getNowPlayingMovies } from '../services/tmdbService.js';

export async function handleMovieRoutes(req, res) {
  if (req.url !== '/api/movies') {
    return false;
  }

  try {
    const data = await getNowPlayingMovies();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  } catch (error) {
    console.error(error);

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unable to load movies' }));
  }

  return true;
}
