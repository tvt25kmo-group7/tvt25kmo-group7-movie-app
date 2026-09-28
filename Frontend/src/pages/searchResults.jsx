import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/movieCard';
import './searchResults.css';

const genres = [
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('query') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const year = searchParams.get('year') ?? '';
  const yearFrom = searchParams.get('yearFrom') ?? '';
  const yearTo = searchParams.get('yearTo') ?? '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedGenre, setSelectedGenre] = useState(genre);
  const [selectedYearFrom, setSelectedYearFrom] = useState(
    yearFrom || year
  );
  const [selectedYearTo, setSelectedYearTo] = useState(yearTo);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [criteriaError, setCriteriaError] = useState('');

  useEffect(() => {
    setSearchQuery(query);
    setSelectedGenre(genre);
    setSelectedYearFrom(yearFrom || year);
    setSelectedYearTo(yearTo);
  }, [query, genre, year, yearFrom, yearTo]);

  useEffect(() => {
    async function fetchSearchResults() {
      const hasCriteria = Boolean(
        genre || year || yearFrom || yearTo
      );

      if (!query && !hasCriteria) {
        setMovies([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        let requestUrl;

        if (hasCriteria) {
          const criteriaParams = new URLSearchParams();

          if (genre) {
            criteriaParams.set('genre', genre);
          }

          if (year) {
            criteriaParams.set('year', year);
          }

          if (yearFrom) {
            criteriaParams.set('yearFrom', yearFrom);
          }

          if (yearTo) {
            criteriaParams.set('yearTo', yearTo);
          }

          requestUrl = `/api/search/criteria?${criteriaParams.toString()}`;
        } else {
          requestUrl =
            `/api/search?query=${encodeURIComponent(query)}`;
        }

        const response = await fetch(requestUrl);

        if (!response.ok) {
          throw new Error('Search request failed');
        }

        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error('Movie search failed:', error);
        setError('Could not search movies and series.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query, genre, year, yearFrom, yearTo]);

  const handleNameSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setError('Enter a movie or series name.');
      return;
    }

    setError('');
    setCriteriaError('');

    setSearchParams({
      query: trimmedQuery
    });
  };

  const handleCriteriaSearch = (event) => {
    event.preventDefault();

    const trimmedYearFrom = selectedYearFrom.trim();
    const trimmedYearTo = selectedYearTo.trim();

    setError('');
    setCriteriaError('');

    if (
      !selectedGenre &&
      !trimmedYearFrom &&
      !trimmedYearTo
    ) {
      setCriteriaError(
        'Select a genre or enter a year.'
      );
      return;
    }

    const isValidYear = (value) => {
      if (!value) {
        return true;
      }

      return /^\d{4}$/.test(value) && Number(value) >= 1878;
    };

    if (
      !isValidYear(trimmedYearFrom) ||
      !isValidYear(trimmedYearTo)
    ) {
      setCriteriaError(
        'Years must be valid four-digit years.'
      );
      return;
    }

    if (
      trimmedYearFrom &&
      trimmedYearTo &&
      Number(trimmedYearFrom) > Number(trimmedYearTo)
    ) {
      setCriteriaError(
        'The starting year cannot be later than the ending year.'
      );
      return;
    }

    const newSearchParams = new URLSearchParams();

    if (selectedGenre) {
      newSearchParams.set('genre', selectedGenre);
    }

    if (trimmedYearFrom && trimmedYearTo) {
      newSearchParams.set('yearFrom', trimmedYearFrom);
      newSearchParams.set('yearTo', trimmedYearTo);
    } else if (trimmedYearFrom || trimmedYearTo) {
      newSearchParams.set(
        'year',
        trimmedYearFrom || trimmedYearTo
      );
    }

    setSearchParams(newSearchParams);
  };

  return (
    <section className="search-results">
      <h1>Search Results</h1>

      <form
        className="search-bar"
        onSubmit={handleNameSearch}
      >
        <label
          htmlFor="results-search"
          className="visually-hidden"
        >
          Search movies and series
        </label>

        <input
          id="results-search"
          type="search"
          placeholder="Search movies and series..."
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery(event.target.value)
          }
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <form
        className="criteria-search"
        onSubmit={handleCriteriaSearch}
      >
        <div>
          <label htmlFor="genre">Genre</label>

          <select
            id="genre"
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
          <label htmlFor="year-from">Year from</label>

          <input
            id="year-from"
            type="number"
            min="1878"
            max="9999"
            placeholder="2000"
            value={selectedYearFrom}
            onChange={(event) =>
              setSelectedYearFrom(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="year-to">Year to</label>

          <input
            id="year-to"
            type="number"
            min="1878"
            max="9999"
            placeholder="2010"
            value={selectedYearTo}
            onChange={(event) =>
              setSelectedYearTo(event.target.value)
            }
          />
        </div>

        <button type="submit" disabled={loading}>
          Search by criteria
        </button>
      </form>

      {criteriaError && <p>{criteriaError}</p>}
      {error && <p>{error}</p>}

      {!loading &&
        !error &&
        !criteriaError &&
        (query || genre || year || yearFrom || yearTo) &&
        movies.length === 0 && (
          <p>No movies or series found.</p>
        )}

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
    </section>
  );
}