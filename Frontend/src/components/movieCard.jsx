import './movieCard.css';
import { useNavigate } from 'react-router-dom';


export default function MovieCard({ movieId, mediaType, title, posterPath }) {
  const navigate = useNavigate();

  const openDetails = () => {
    navigate(`/${mediaType}/${movieId}`);
  };

  const posterUrl = posterPath 
  ? `https://image.tmdb.org/t/p/w500${posterPath}` 
  : null;
  
  return (
    <article className="movie-card">
      <button type="button" className="movie-card__button" onClick={openDetails}>
        <div className="movie-card__poster">
          {posterUrl && (
            <img src={posterUrl} alt={title} />
          )}
        </div>
        <h3>{title}</h3>
      </button>
    </article>
  );
}