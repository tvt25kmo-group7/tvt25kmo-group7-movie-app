export default function MovieCard({ title }) {
  return (
    <article className="movie-card">
      <div className="movie-card__poster">
        Poster
      </div>

      <h3>{title}</h3>
    </article>
  );
}