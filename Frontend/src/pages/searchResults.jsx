import MovieCard from '../components/movieCard';
import './searchResults.css';

export default function SearchResults() {
  return (
    <section className="search-results">
      <h1>Search Results</h1>

      <div className="search-bar">
        <label htmlFor="results-search" className="visually-hidden">
          Search movies and series
        </label>

        <input
          id="results-search"
          type="search"
          placeholder="Search movies and series..."
        />

        <button type="button">
          Search
        </button>
      </div>

      <div className="movie-grid">
        <MovieCard title="Movie 1" />
        <MovieCard title="Movie 2" />
        <MovieCard title="Movie 3" />
        <MovieCard title="Movie 4" />
      </div>
    </section>
  );
}