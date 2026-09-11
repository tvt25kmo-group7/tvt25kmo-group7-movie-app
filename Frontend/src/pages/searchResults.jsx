import MovieCard from '../components/movieCard';

export default function SearchResults() {
  return (
    <section className="search-results">
      <h1>Search Results</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search movies..."
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