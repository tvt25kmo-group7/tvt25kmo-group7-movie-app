import { useEffect, useRef, useState } from 'react';
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

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitError, setReviewSubmitError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Lets the Review button scroll straight to the form below.
  const reviewFormRef = useRef(null);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  const posterUrl = movieDetails?.posterPath
    ? `https://image.tmdb.org/t/p/w500${movieDetails.posterPath}`
    : null;

  const handleReviewClick = () => {
    reviewFormRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const buildReviewQuery = () =>
    new URLSearchParams({ mediaType, tmdbId: movieId }).toString();

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewSubmitError('');
    setReviewSuccess('');

    // A review cannot be published until the user selects one to five stars.
    if (selectedRating < 1 || selectedRating > 5) {
      setReviewSubmitError('Select a rating from one to five stars.');
      return;
    }

    if (!user?.token) {
      setReviewSubmitError('Sign in to publish a review.');
      return;
    }

    setReviewSubmitting(true);

    try {
      // The backend gets the reviewer identity from the authentication token.
      const response = await authenticatedFetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType,
          tmdbId: Number(movieId),
          rating: selectedRating,
          reviewText: reviewText.trim(),
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      // One review per user and title is enforced by the backend/database.
      if (response.status === 409) {
        setReviewSubmitError(
          responseData.error || 'You already reviewed this title.',
        );
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Could not publish the review.');
      }

      // Clear the form after the backend confirms that the review was saved.
      setReviewText('');
      setSelectedRating(0);
      setReviewSuccess('Your review has been published.');

      // Reload the list so the new card includes its saved username and timestamp.
      const reviewsResponse = await fetch(`/api/reviews?${buildReviewQuery()}`);
      if (!reviewsResponse.ok) {
        throw new Error('Review published, but the list could not be refreshed.');
      }

      const updatedReviews = await reviewsResponse.json();
      if (!Array.isArray(updatedReviews)) {
        throw new Error('Review published, but the response was invalid.');
      }
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error publishing review:', error);
      setReviewSubmitError(
        error instanceof Error ? error.message : 'Could not publish the review.',
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddFavorite = async () => {
    if (!user?.token) {
      return;
    }

    try {
      const response = await authenticatedFetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tmdbId: Number(movieId),
          mediaType: mediaType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add favorite');
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  };

  // Load the selected title's details independently from its reviews.
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

  // Fetches reviews for the current title whenever its route identity changes.
  useEffect(() => {
    let isCurrentTitle = true;

    async function fetchReviews() {
      // Reset review-specific UI while the selected title's reviews are loading.
      setReviewsLoading(true);
      setReviewError('');
      setReviews([]);

      try {
        const response = await fetch(`/api/reviews?${buildReviewQuery()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        // The endpoint returns an array of reviews with username and created_at.
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Review response was not an array');
        }

        if (isCurrentTitle) {
          setReviews(data);
        }
      } catch (error) {
        // Keep review loading errors separate from movie-detail loading errors.
        console.error('Error fetching reviews:', error);
        if (isCurrentTitle) {
          setReviewError('Failed to load reviews.');
        }
      } finally {
        // Do not let an earlier request update loading state for a newer title.
        if (isCurrentTitle) {
          setReviewsLoading(false);
        }
      }
    }

    fetchReviews();

    // Ignore late responses if the user navigates to another title mid-request.
    return () => {
      isCurrentTitle = false;
    };
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

            {/* Scrolls to the review form; submission is handled there. */}
            <button
              type="button"
              className="button-secondary"
              onClick={handleReviewClick}
            >
              Review
            </button>

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
            {(movieDetails.genres ?? []).map((genre) => (
              <span key={genre.id}>{genre.name}</span>
            ))}
          </div>

          <section className="movie-details__section">
            <h2>Synopsis</h2>

            <p>
                {movieDetails.overview || "No synopsis available."}
            </p>
          </section>

          <section className="movie-details__section">
            <h2>Reviews</h2>

            {reviewsLoading ? (
              <p role="status">Loading reviews...</p>
            ) : reviewError ? (
              <p role="alert">{reviewError}</p>
            ) : reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              // Render one review card for each record returned by the backend.
              reviews.map((review) => {
                const rating = Number(review.rating);

                return (
                  <article
                    className="review-card"
                    key={review.id ?? `${review.username}-${review.created_at}`}
                  >
                    <div className="review-card__header">
                      {/* Display a five-star visualization and expose its value
                          to assistive technology as readable text. */}
                      <span aria-label={`${rating} out of 5 stars`}>
                        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                      </span>

                      {/* The API joins the review to its author and returns the
                          username alongside the review data. */}
                      <strong>{review.username}</strong>

                      {/* created_at is saved by the database when the review is
                          published; dateTime preserves the machine-readable value. */}
                      <time dateTime={review.created_at}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </time>
                    </div>

                    {/* Review text is optional, so omit the paragraph if empty. */}
                    {review.review_text?.trim() && <p>{review.review_text}</p>}
                  </article>
                );
              })
            )}
          </section>

          {/* Signed-out users see a prompt instead of the submit fields below. */}
          <form
            ref={reviewFormRef}
            onSubmit={handleReviewSubmit}
            className="movie-details__section review-form"
          >
            <h2>Write a Review</h2>

            {user?.token ? (
              <>
                {reviewSubmitError && (
                  <p role="alert">{reviewSubmitError}</p>
                )}
                {reviewSuccess && (
                  <p role="status">{reviewSuccess}</p>
                )}

                <div className="review-rating">
                  <span>Your Rating</span>

                  <div className="review-stars">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const isSelected = selectedRating >= rating;

                      return (
                        <button
                          key={rating}
                          type="button"
                          aria-label={`Select ${rating} star${rating === 1 ? '' : 's'}`}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedRating(rating)}
                        >
                          {isSelected ? '★' : '☆'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label htmlFor="review-text">
                  Review
                </label>

                <textarea
                  id="review-text"
                  rows="5"
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                />

                <button
                  type="submit"
                  className="button-primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? 'Publishing...' : 'Submit'}
                </button>
              </>
            ) : (
              // Keep the prompt at the same scroll destination as the form.
              <p role="status">Sign in to write a review for this title.</p>
            )}
          </form>
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