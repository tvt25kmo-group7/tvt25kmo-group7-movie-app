import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import ShareWithGroupModal from '../components/shareWithGroupModal';
import CreateGroupModal from '../components/createGroupModal';

import './movieDetails.css';

export default function MovieDetails() {
  const { movieId, mediaType } = useParams();
  const {user, authenticatedFetch} = useAuth();

  const [movieDetails, setMovieDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const posterUrl = movieDetails?.posterPath
    ? `https://image.tmdb.org/t/p/w500${movieDetails.posterPath}`
    : null;

  const handleAddFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          tmdbId: movieId,
          mediaType: mediaType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const response = await fetch(`/api/movies/${mediaType}/${movieId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }

        const data = await response.json();
        setMovieDetails(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setError('Failed to fetch movie details');
      } finally {
        setLoading(false);
      }
    }

    fetchMovieDetails();
  }, [mediaType, movieId]);

  if (loading) {
    return <p>Loading movie details...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  if (!movieDetails) {
    return <p>No movie details available.</p>;
  }

  return (
    <>
      <section className="movie-details">
        <div className="movie-details__poster-column">
          <div className="movie-details__poster">
            {posterUrl ? (
              <img 
              src={posterUrl} 
              alt={movieDetails.title} 
              />
            ) : (
              <span> No poster image available</span> 
            )}
          </div>

          <div className="movie-details__poster-actions">
            {user?.token && (
                <button
                type="button"
                className="button-primary"
                onClick={handleAddFavorite}
                >
                Add to Favorites
              </button>
            )}

            <button
              type="button"
              className="button-secondary"
              onClick={() => setShareModalOpen(true)}
            >
              Share with Group
            </button>
          </div>

        </div>

        <div className="movie-details__content">
          <h1>{movieDetails.title}</h1>

          <div className="movie-details__meta">
            <span>{movieDetails.releaseDate?.split('-')[0]}</span>
            <span>•</span>
            <span> min</span>
            <span>•</span>
            <span>★★★★☆ /5</span>
          </div>

          <div className="movie-details__genres">
            <span>Action</span>
            <span>Sci-Fi</span>
            <span>Drama</span>
          </div>

          <section className="movie-details__section">
            <h2>Synopsis</h2>

            <p>
                {movieDetails.overview || "No synopsis available."}
            </p>
          </section>

          <section className="movie-details__section">
            <h2>Reviews</h2>

            <article className="review-card">
              <div className="review-card__header">
                <span>★★★★☆</span>
                <strong>Joona</strong>
              </div>

              <p>
                iha jees iha jees
              </p>
            </article>

            <article className="review-card">
              <div className="review-card__header">
                <span>★★★★★</span>
                <strong>Jani</strong>
              </div>

              <p>
                Hyvä leffa jeejee
              </p>
            </article>
          </section>

          <section className="movie-details__section review-form">
            <h2>Write a Review</h2>

            <div className="review-rating">
              <span>Your Rating</span>

              <div className="review-stars">
                <button type="button" aria-label="1 star">☆</button>
                <button type="button" aria-label="2 stars">☆</button>
                <button type="button" aria-label="3 stars">☆</button>
                <button type="button" aria-label="4 stars">☆</button>
                <button type="button" aria-label="5 stars">☆</button>
              </div>
            </div>

            <label htmlFor="review-text">
              Review
            </label>

            <textarea
              id="review-text"
              rows="5"
              placeholder="Write your review..."
            />

            <button
              type="button"
              className="button-primary"
            >
              Submit
            </button>
          </section>
        </div>
      </section>

      {shareModalOpen && (
        <ShareWithGroupModal
          onClose={() => setShareModalOpen(false)}
          onOpenCreateGroup={() => {
            setShareModalOpen(false);
            setCreateGroupModalOpen(true);
          }}
        />
      )}

      {createGroupModalOpen && (
        <CreateGroupModal
          onClose={() => setCreateGroupModalOpen(false)}
        />
      )}
    </>
  );
}