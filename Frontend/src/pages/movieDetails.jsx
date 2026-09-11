export default function MovieDetails() {
  return (
    <section className="movie-details">
      <div className="movie-details__poster">
        Poster
      </div>

      <div className="movie-details__content">
        <h1>Movie Title</h1>

        <p>2026 • 2h 10min</p>

        <p>
          Movie description will be shown here.
        </p>

        <div>
          <button type="button">
            Add to Favorites
          </button>

          <button type="button">
            Share with Group
          </button>
        </div>
      </div>
    </section>
  );
}