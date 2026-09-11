import MovieCard from '../components/movieCard';

export default function Favorites() {
  return (
    <section className="favorites-page">
      <div className="favorites-header">
        <div>
          <h1>Favorites</h1>
          <p>Your saved movies.</p>
        </div>

        <button type="button">
          Share List
        </button>
      </div>

      <div className="movie-grid">
        <MovieCard title="Favorite Movie 1" />
        <MovieCard title="Favorite Movie 2" />
        <MovieCard title="Favorite Movie 3" />
        <MovieCard title="Favorite Movie 4" />
      </div>
    </section>
  );
}