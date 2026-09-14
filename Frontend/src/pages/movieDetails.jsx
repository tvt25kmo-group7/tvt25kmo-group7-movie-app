import { useState } from 'react';

import ShareWithGroupModal from '../components/shareWithGroupModal';
import CreateGroupModal from '../components/createGroupModal';

import './movieDetails.css';

export default function MovieDetails() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  return (
    <>
      <section className="movie-details">
        <div className="movie-details__poster-column">
          <div className="movie-details__poster">
            Poster
          </div>

          <div className="movie-details__poster-actions">
            <button
              type="button"
              className="button-primary"
            >
              Add to Favorites
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
          <h1>Movie Title</h1>

          <div className="movie-details__meta">
            <span>2026</span>
            <span>•</span>
            <span>2h 10min</span>
            <span>•</span>
            <span>★★★★☆ 4.2/5 katotaa mitä näistä laitetaan tähän</span>
          </div>

          <div className="movie-details__genres">
            <span>Action</span>
            <span>Sci-Fi</span>
            <span>Drama</span>
          </div>

          <section className="movie-details__section">
            <h2>Synopsis</h2>

            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
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