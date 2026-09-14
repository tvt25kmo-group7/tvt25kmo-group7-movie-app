import MovieCard from '../components/movieCard';
import './home.css';

export default function Home() {
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