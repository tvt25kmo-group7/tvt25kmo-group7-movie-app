const tmdbToken = process.env.TMDB_API_TOKEN;

//nowplayingmovies is for fetching the list of movies that are currently playing in finnish theaters
async function getNowPlayingMovies() {
  const url =
    'https://api.themoviedb.org/3/movie/now_playing' +
    '?region=FI&language=fi-FI&page=1';

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${tmdbToken}`,
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

export { getNowPlayingMovies };