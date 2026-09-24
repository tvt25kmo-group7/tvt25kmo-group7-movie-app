import { useState, useEffect } from 'react';
import MovieCard from '../components/movieCard';
import { useAuth } from '../context/AuthContext';
import './favorites.css';

export default function Favorites() {
  const { user, authenticatedFetch } = useAuth();
  
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if(!user?.token) {
      setError('You must be logged in to view your favorites.');
      setLoading(false);
      return;
    }
    async function fetchFavoriteMovies() {
      try {
        const response = await authenticatedFetch(
          'http://localhost:5000/api/favorites'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch favorite movies');
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error(error);
        setError('Could not load favorite movies');
      } finally {
        setLoading(false);
      }
    }
    fetchFavoriteMovies();
  }, [user?.token, authenticatedFetch]);

  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <div>
          <h1>Favorites</h1>
        

        <button type="button">
          Share List
        </button>
      </div>

      <div className="movie-grid">
        {loading && <p>Loading favorite movies...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && movies.length === 0 && (
           <p>You don't have any favorites yet. <br></br>
            You can add movies to your favorites from the movie details page.</p> )
        }
        {!loading && !error && movies.length > 0 && (
          <div className="movie-grid">
            {movies.map((movie) => (
            <MovieCard
              key={`${movie.mediaType}-${movie.tmdbId}`}
              movieId={movie.tmdbId}
              mediaType={movie.mediaType}
              title={movie.title} 
              posterPath={movie.posterPath} 
            />
          ))}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
        
