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


export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('query') ?? '';
  const genre = searchParams.get('genre') ?? '';
  const year = searchParams.get('year') ?? '';
  const yearFrom = searchParams.get('yearFrom') ?? '';
  const yearTo = searchParams.get('yearTo') ?? '';

  const initialYearRange =
    year ||
    (
      yearFrom && yearTo
        ? `${yearFrom}-${yearTo}`
        : yearFrom || yearTo
    );

  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedGenre, setSelectedGenre] = useState(genre);
  const [selectedYearRange, setSelectedYearRange] = useState(
    initialYearRange
  );

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    setSearchQuery(query);
    setSelectedGenre(genre);

    if (year) {
      setSelectedYearRange(year);
    } else if (yearFrom && yearTo) {
      setSelectedYearRange(`${yearFrom}-${yearTo}`);
    } else {
      setSelectedYearRange(yearFrom || yearTo);
    }
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

          if (query) {
            criteriaParams.set('query', query);
          }

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

          requestUrl =
            `/api/search/criteria?${criteriaParams.toString()}`;
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


  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = searchQuery.trim();
    const parsedYears = parseYearRange(selectedYearRange);

    setError('');
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

    const newSearchParams = new URLSearchParams();

    if (trimmedQuery) {
      newSearchParams.set('query', trimmedQuery);
    }

    if (selectedGenre) {
      newSearchParams.set('genre', selectedGenre);
    }

    if (parsedYears.year) {
      newSearchParams.set('year', parsedYears.year);
    }

    if (parsedYears.yearFrom) {
      newSearchParams.set(
        'yearFrom',
        parsedYears.yearFrom
      );
    }

    if (parsedYears.yearTo) {
      newSearchParams.set(
        'yearTo',
        parsedYears.yearTo
      );
    }

    setSearchParams(newSearchParams);
  };


  return (
    <section className="search-results">
      <h1>Search Results</h1>

      <form
        onSubmit={handleSearch}>
        <div className="search-bar">
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
        </div>

        <div className="criteria-search">
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
            <label htmlFor="year-range">
              Year or year range
            </label>

            <input
              id="year-range"
              type="text"
              placeholder="2008 or 2000-2010"
              value={selectedYearRange}
              onChange={(event) =>
                setSelectedYearRange(event.target.value)
              }
            />
          </div>
        </div>

        {searchError && <p>{searchError}</p>}
      </form>

      {error && <p>{error}</p>}

      {!loading &&
        !error &&
        !searchError &&
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