import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MovieCard from '../components/movieCard';
import { useAuth } from '../context/AuthContext';
import './favorites.css';

export default function Favorites() {
  const { user, authLoading, authenticatedFetch } = useAuth();  
  const { token } = useParams();

  const [movies, setMovies] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [shareLoading, setShareLoading] = useState(false); 
  const [shareError, setShareError] = useState('');

useEffect(() => { 
  async function fetchFavoriteMovies() { 
    try { 
      setLoading(true); setError(''); 

      if (token) { 
        const [response, usersResponse] = await Promise.all([
          fetch(`/api/favorites/${token}`),
          fetch('/api/users/shared-favorites'),
        ]);

        if (!response.ok) { 
          throw new Error('Failed to fetch shared favorite movies'); 
        } 
        
        const data = await response.json();
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          const owner = users.find((sharedUser) => (
            sharedUser.favorites_share_token === token
          ));
          setOwnerName(owner?.username ?? '');
        }

        setMovies(data.results ?? []); 
        return; } 

        setOwnerName('');
        
        if (authLoading /*|| !user?.token*/) { 
          return; 
        } 
        
        const response = await authenticatedFetch('/api/favorites'); 
        
        if (!response.ok) { 
          throw new Error('Failed to fetch favorite movies'); 
        } 
        const data = await response.json(); 
        setMovies(data.results ?? []); 
      } catch (error) { 
        console.error(error); 
        setError( token ? 'Could not load shared favorite movies' : 'Could not load favorite movies' ); 
      } finally { 
        setLoading(false); 
      } 
    } 
    fetchFavoriteMovies(); 
  }, [token, authLoading, user?.token, authenticatedFetch]);

  const handleShareList = async () => { 
    try { 
      setShareLoading(true); 
      setShareError(''); 
      
      const response = await authenticatedFetch( 
        '/api/users/share-token', 
        { method: 'POST', },
       ); 
       
       if (!response.ok) { 
        throw new Error('Failed to create share token'); 
      } 
      
    await response.json();
    } catch (error) { 
      console.error(error); 
      setShareError('Could not create shared favorites link'); 
    } finally { 
      setShareLoading(false); 
    } 
  };

  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <div>
          <h1>
            {token
              ? ownerName ? `${ownerName}'s Favorites` : 'Favorites'
              : 'My Favorites'}
          </h1>
        </div>

        {!token && (
          <button
            type="button"
            onClick={handleShareList}
            disabled={shareLoading}
          >
            {shareLoading ? 'Creating...' : 'Share List'}
          </button>
        )}

          {!token && shareError && (
            <p>{shareError}</p>
          )}
   
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
              key={movie.tmdbId}
              movieId={movie.tmdbId}
              mediaType={movie.mediaType}
              title={movie.title} 
              posterPath={movie.posterPath} 
            />
          ))}
          </div>
        )}
      </div>
    </section>
  );
}
