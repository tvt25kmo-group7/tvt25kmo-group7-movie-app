import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/movieCard';
import './home.css';
import { useAuth } from '../context/AuthContext';


const genres = [
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
];


const parseYearRange = (value) => {
  const normalizedValue = value.trim().replace(/\s+/g, '');

  if (!normalizedValue) {
    return {
      year: '',
      yearFrom: '',
      yearTo: '',
    };
  }

  const match = normalizedValue.match(
    /^(\d{4})(?:-(\d{4}))?$/
  );

  if (!match) {
    return null;
  }

  const firstYear = match[1];
  const secondYear = match[2];

  if (
    Number(firstYear) < 1878 ||
    (secondYear && Number(secondYear) < 1878)
  ) {
    return null;
  }

  if (
    secondYear &&
    Number(firstYear) > Number(secondYear)
  ) {
    return null;
  }

  if (secondYear) {
    return {
      year: '',
      yearFrom: firstYear,
      yearTo: secondYear,
    };
  }

  return {
    year: firstYear,
    yearFrom: '',
    yearTo: '',
  };
};


export default function Home({}) {
  const { user, authLoading, authenticatedFetch } = useAuth();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentIndex, setCurrentIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCriteria, setShowCriteria] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState('');
  const [searchError, setSearchError] = useState('');

  const [sharedFavorites, setSharedFavorites] = useState([]);
  const [sharedFavoritesIndex, setSharedFavoritesIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNowPlayingMovies() {
      try {
        const response = await fetch('/api/movies');
        if (!response.ok) {
          throw new Error(`Failed to fetch now-playing movies`);
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

  useEffect(() => {
  async function fetchSharedFavorites() {
    try {
      const response = await fetch(
        '/api/users/shared-favorites'
      );

      if (!response.ok) {
        throw new Error(
          'Failed to fetch shared favorite lists'
        );
      }

      const data = await response.json();

      setSharedFavorites(data);
    } catch (error) {
      console.error(
        'Failed to fetch shared favorite lists:',
        error
      );
    }
  }

  fetchSharedFavorites();
  }, []);

  const getCarouselStep = () => {
    return window.innerWidth < 768 ? 1 : 3;
  };

  const visibleCount = 4;

  const carouselMovies = [
    ...movies,
    ...movies.slice(0, visibleCount)
  ];

  const nextCarousel = (length, setIndex) => {
    if (length === 0) return;


    setIndex((current) => (current + getCarouselStep()) % length);
  };

  const previousCarousel = (length, setIndex) => {
    if (length === 0) return;

    setIndex(
      (current) => (current - getCarouselStep() + length) % length
    );
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    const parsedYears = parseYearRange(selectedYearRange);

    setSearchError('');

    if (
      !trimmedQuery &&
      !selectedGenre &&
      !selectedYearRange.trim()
    ) {
      setSearchError(
        'Enter a name or select search criteria.'
      );
      return;
    }

    if (!parsedYears) {
      setSearchError(
        'Enter a year like 2008 or a range like 2000-2010.'
      );
      return;
    }

    const params = new URLSearchParams();

    if (trimmedQuery) {
      params.set('query', trimmedQuery);
    }

    if (selectedGenre) {
      params.set('genre', selectedGenre);
    }

    if (parsedYears.year) {
      params.set('year', parsedYears.year);
    }

    if (parsedYears.yearFrom) {
      params.set('yearFrom', parsedYears.yearFrom);
    }

    if (parsedYears.yearTo) {
      params.set('yearTo', parsedYears.yearTo);
    }

    navigate(`/search?${params.toString()}`);
  };


  return (
    <section className="home">
      <section className="hero">
        <h1>Discover and Share Movies and Series</h1>

        <p>
          Search for movies and series, save favorites and share them with your groups.
        </p>

        <form className="home-search" onSubmit={handleSearch}>
          <div className="search-bar">
            <label htmlFor="home-search" className="visually-hidden">
              Search movies and series
            </label>

            <input
              id="home-search"
              type="search"
              placeholder="Search movies and series..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />

            <button type="submit">
              Search
            </button>

            <button
              type="button"
              className="filter-toggle"
              onClick={() =>
                setShowCriteria((current) => !current)
              }
              aria-expanded={showCriteria}
              aria-controls="home-search-criteria"
            >
              {showCriteria ? 'Hide filters' : 'Filters'}
            </button>
          </div>

          {showCriteria && (
            <div
              id="home-search-criteria"
              className="home-search-criteria"
            >
              <div>
                <label htmlFor="home-genre">Genre</label>

                <select
                  id="home-genre"
                  value={selectedGenre}
                  onChange={(event) =>
                    setSelectedGenre(event.target.value)
                  }
                >
                  <option value="">Any genre</option>

                  {genres.map((genreOption) => (
                    <option
                      key={genreOption.id}
                      value={genreOption.id}
                    >
                      {genreOption.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="home-year-range">
                  Year or year range
                </label>

                <input
                  id="home-year-range"
                  type="text"
                  placeholder="2008 or 2000-2010"
                  value={selectedYearRange}
                  onChange={(event) =>
                    setSelectedYearRange(event.target.value)
                  }
                />
              </div>
            </div>
          )}

          {searchError && (
            <p className="home-search-error">
              {searchError}
            </p>
          )}
        </form>
      </section>

      <section className="now-playing">
        <h2>Now Playing In Theaters In Finland</h2>

        {loading && <p>Loading movies...</p>}
        {error && <p>{error}</p>}

        {!loading && !error && movies.length > 0 && (            
            <div className="movie-grid">
              
              <button className="carousel-button" onClick={() => previousCarousel(movies.length, setCurrentIndex)}>&lt;</button>
              <div className="movie-grid__frame">
                <div className="movie-grid__viewport" style={{ '--carousel-index': currentIndex }}>
                  {carouselMovies.map((movie) => (
                    <MovieCard 
                      key={movie.tmdbId} 
                      movieId={movie.tmdbId}
                      mediaType={movie.mediaType}
                      title={movie.title} 
                      posterPath={movie.posterPath} 
                  />
                  ))}
                </div>
              </div>
              <button className="carousel-button"onClick={() => nextCarousel(movies.length, setCurrentIndex)}>&gt;</button>
            </div>
        )}
      </section>

      <section className="shared-favorites">
        <h2>Shared Favorites</h2>

        {sharedFavorites.length > 0 && (
          <div className="movie-grid">
            <button
              className="carousel-button"
              onClick={() => previousCarousel(sharedFavorites.length, setSharedFavoritesIndex)}
            >
              &lt;
            </button>

            <div className="movie-grid__frame">
              <div
                className="movie-grid__viewport"
                style={{
                  '--carousel-index': sharedFavoritesIndex,
                }}
              >
                {sharedFavorites.map((sharedFavorite) => {
                  const shareUrl =
                    `${window.location.origin}/favorites/${sharedFavorite.favorites_share_token}`;

                  return (
                    <div
                      className="shared-favorite-card"
                      key={sharedFavorite.favorites_share_token}
                    >
                      <h3>{sharedFavorite.username}</h3>

                      <a href={shareUrl}>
                        {shareUrl}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              className="carousel-button"
              onClick={() => nextCarousel(sharedFavorites.length, setSharedFavoritesIndex)}
            >
              &gt;
            </button>
          </div>
        )}
      </section>

      <section className="shared-favorites">
        <h2>Shared Favorites</h2>

        {sharedFavorites.length > 0 && (
          <div className="movie-grid">
            <button
              className="carousel-button"
              onClick={() => previousCarousel(sharedFavoritesIndex, sharedFavorites.length, setSharedFavoritesIndex)}
            >
              &lt;
            </button>

            <div className="movie-grid__frame">
              <div
                className="movie-grid__viewport"
                style={{
                  '--carousel-index': sharedFavoritesIndex,
                }}
              >
                {sharedFavorites.map((sharedFavorite) => {
                  const shareUrl =
                    `${window.location.origin}/favorites/${sharedFavorite.favorites_share_token}`;

                  return (
                    <div
                      className="shared-favorite-card"
                      key={sharedFavorite.favorites_share_token}
                    >
                      <h3>{sharedFavorite.username}</h3>

                      <a href={shareUrl}>
                        {shareUrl}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              className="carousel-button"
              onClick={() => nextCarousel(sharedFavoritesIndex, sharedFavorites.length, setSharedFavoritesIndex)}
            >
              &gt;
            </button>
          </div>
        )}
      </section>
    </section>
  );
}
