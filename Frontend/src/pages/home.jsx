import MovieCard from '../components/movieCard';

export default function Home() {
  return (
    <section className="home">
      <section className="hero">
        <h1>Discover and Share Movies</h1>

        <p>
          Search for movies, save favorites and share them with your groups.
        </p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search movies..."
          />

          <button type="button">
            Search
          </button>
        </div>
      </section>

      <section className="now-playing">
        <h2>Now Playing</h2>

        <div className="movie-grid">
          <MovieCard title="Movie 1" />
          <MovieCard title="Movie 2" />
          <MovieCard title="Movie 3" />
          <MovieCard title="Movie 4" />
        </div>
      </section>
    </section>
  );
}