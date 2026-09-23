import { useEffect, useState } from 'react';
import MovieCard from '../components/movieCard';
import './home.css';


export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchNowPlayingMovies() {
      try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
          throw new Error('Failed to fetch now-playing movies');
        }

        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error(error);
        setError('Could not load movies');
      } finally {
        setLoading(false);
      }
    }
    fetchNowPlayingMovies();
  }, []);

  const visibleCount = 4;

  const carouselMovies = [
    ...movies,
    ...movies.slice(0, visibleCount)
  ];

  const nextMovies = () => {
    if (movies.length === 0) return;

    setCurrentIndex(
      (current) => (current + 3) % movies.length
    );
  };

  const previousMovies = () => {
    if (movies.length === 0) return;

    setCurrentIndex(
      (current) => (current - 3 + movies.length) % movies.length
    );
  };




  return (
    <section className="home">
      <section className="hero">
        <h1>Discover and Share Movies and Series</h1>

        <p>
          Search for movies and series, save favorites and share them with your groups.
        </p>

        <div className="search-bar">
          <label htmlFor="home-search" className="visually-hidden">
            Search movies and series
          </label>

          <input
            id="home-search"
            type="search"
            placeholder="Search movies and series..."
          />

          <button type="button">
            Search
          </button>
        </div>
      </section>

      <section className="now-playing">
        <h2>Now Playing In Theaters In Finland</h2>

        {loading && <p>Loading movies...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && movies.length > 0 && (            
            <div className="movie-grid">
              
              <button className="carousel-button" onClick={previousMovies}>&lt;</button>
              <div className="movie-grid__frame">
                <div className="movie-grid__viewport" style={{ '--carousel-index': currentIndex }}>
                  {carouselMovies.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      title={movie.title} 
                      posterPath={movie.poster_path} 
                  />
                  ))}
                </div>
              </div>
          
              <button className="carousel-button"onClick={nextMovies}>&gt;</button>
            </div>
        )}
      </section>
    </section>
  );
}