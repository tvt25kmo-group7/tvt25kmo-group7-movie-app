import './movieCard.css';
export default function MovieCard({ title, posterPath }) {
  const posterUrl = posterPath ? 
  `https://image.tmdb.org/t/p/w500${posterPath}` 
  : null;
  
  return (
    <article className="movie-card">
      <div className="movie-card__poster">
        <img src={posterUrl} alt={title} />
      </div>

      <h3>{title}</h3>
    </article>
  );
}