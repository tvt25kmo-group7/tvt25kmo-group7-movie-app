import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../components/movieCard';
import './profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, authenticatedFetch, logout } = useAuth();

  const [activeSection, setActiveSection] = useState('rated');
  const [account, setAccount] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewMovies, setReviewMovies] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  // Haetaan tiedot vain kirjautuneen käyttäjän vaihtuessa.
  // Token recycling ei käynnistä hakua uudelleen.
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    async function loadAccount() {
      try {
        const response = await authenticatedFetch(
          '/api/users/me',
        );

        if (!response.ok) {
          console.error('Account request failed:', response.status);
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setAccount(data);
        }
      } catch (error) {
        console.error('Account request failed:', error);
      }
    }

    loadAccount();

    return () => {
      cancelled = true;
    };

    // authenticatedFetch muuttuu tokenin vaihtuessa, mutta haluamme
    // hakea tiedot vain käyttäjän ID:n vaihtuessa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    //checks if the user has logged in.
    if (!userId) {
      return;
    }

    let cancelled = false;
    //creates async function inside the useeffect because useEffect itself cannot be async. 
    // because useeffect excpects a cleanup function or nothing to be returned .
    //other wise it breaks the rules of hooks.
    async function loadReviews() {
    //starts loading the reviews.
      setReviewsLoading(true);
      setReviewsError('');

      try {
        const response = await authenticatedFetch('/api/reviews/me'); //waits till the fetched data has returned from the server before continuing
        //checks if the response from the server is not ok, aka HTTP status is not 200-299
        //meaning if the header is not 200-299 front end wont even get the body (data) section
        if (!response.ok) {
          throw new Error(`Reviews request failed (${response.status})`);
        }

        //parses json response from the server into a javascript object
        //response is raw data parsing could take some time, so we await it before continuing
        //canling the request if the component is closed or unmounted by checking the cancelled flag
        const data = await response.json();

        if (cancelled) {
          return;
        }

        //saves the reviews data into the state. in this section reviews only contains mediaType and tmdbId.
        setReviews(data);

        // fetching additional movie details from TMDB for display purposes. using promise.all so we can send mutliple fetch requests same time.
        const movieEntries = await Promise.all(
          data.map(async (review) => { //fetches additional movie details for each review
            try {
              const movieResponse = await fetch( 
                `/api/movies/${review.media_type}/${review.tmdb_id}`,//fetches movie details from the server based on media type and TMDB ID
              );
              //if fetch fails and data is not mediatype and tmdb id combination, return null
              if (!movieResponse.ok) {
                return null;
              }
              //waits for the movie details to be parsed. meaning all the fetches that were made. 
              const movie = await movieResponse.json();
              return [`${review.media_type}-${review.tmdb_id}`, movie];
            } catch {
              return null; //if even one of the fetches fail, return null for that movie. this might cause problems in the UI display.
            }
          }),
        );

        if (!cancelled) {
          setReviewMovies(Object.fromEntries(movieEntries.filter(Boolean)));
        }
      } catch (error) { //if error occurs during the fetch or processing of reviews. this will stop the whole process
        if (!cancelled) {
          console.error('Reviews request failed:', error);
          setReviewsError('Could not load your reviews.');
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();
    //a cleaner function to cancel ongoing requests when the component unmounts or userId changes.
    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); //this tells useeffect to re-run the effect whenever the userId changes

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await authenticatedFetch(
        '/api/users/me',
        { method: 'DELETE' },
      );

      if (response.status !== 204) {
        setDeleteError(`Account deletion failed (${response.status}).`);
        return;
      }

      await logout();
      navigate('/');
    } catch (error) {
      console.error('Account deletion failed', error);
      setDeleteError('Unable to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <h1>{account?.username ?? user?.username ?? 'Profile'}</h1>
          <p>@{account?.username ?? user?.username ?? 'user'}</p>
        </div>
      </div>
      <div className="profile-layout">
        <div className="profile-left">
          <section className="profile-card">
            <h2>Your movie life</h2>

            <div className="profile-stats">
              
              {/*REVIEWED BUTTON */}
              <button
                type="button"
                className={`profile-stat ${activeSection === 'reviewed' ? 'profile-stat--active' : ''}`}
                onClick={() => setActiveSection('reviewed')}
              >
                <strong>{reviews.length}</strong>
                <span>Reviewed titles</span>
              </button>

              {/*FAVORITES BUTTON */}
              <button
                type="button"
                className={`profile-stat ${activeSection === 'favorites' ? 'profile-stat--active' : ''}`}
                onClick={() => setActiveSection('favorites')}
              >
                <strong>8</strong>
                <span>Favorites</span>
              </button>

              {/*GROUP BUTTON */}
              <button
                type="button"
                className={`profile-stat ${activeSection === 'groups' ? 'profile-stat--active' : ''}`}
                onClick={() => setActiveSection('groups')}
              >
                <strong>4</strong>
                <span>Groups</span>
              </button>
            </div>

            <div className="profile-member">
              <span>Member since</span>
              <strong>October 2023</strong>
            </div>
          </section>

          <section className="profile-card">
            <h2>Account</h2>

            <div className="profile-account-row">
              <span>Email</span>
              <span>{account?.email ?? user?.email ?? '—'}</span>
            </div>

            <button 
            type="button" 
            className="button-secondary" 
            onClick={handleDeleteAccount} 
            disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
            {deleteError && <p role="alert">{deleteError}</p>}
          </section>
        </div>

        {/* PROFILE REVIEWED, FAVORITES, AND GROUPS CONTENT */}
        <section className="profile-content-panel">
          {activeSection === 'reviewed' && (
            <>
              <h2>Reviewed titles</h2>

              {reviewsLoading && <p>Loading your reviews...</p>}
              {reviewsError && <p role="alert">{reviewsError}</p>}
              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <p>You haven&apos;t reviewed anything yet.</p>
              )}

              <div className="profile-reviews">
                {reviews.map((review) => {
                  const movie = reviewMovies[`${review.media_type}-${review.tmdb_id}`];

                  return (
                    <article key={review.id} className="profile-review-card">
                      <MovieCard
                        movieId={review.tmdb_id}
                        mediaType={review.media_type}
                        title={movie?.title ?? `#${review.tmdb_id}`}
                        posterPath={movie?.posterPath}
                      />
                      <div className="profile-review-meta">
                        <strong>{review.rating} / 5</strong>
                        {review.review_text && <p>{review.review_text}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {activeSection === 'favorites' && (
            <>
              <h2>Favorites</h2>
              <p>Your favorite movies will be shown here.</p>
            </>
          )}

          {activeSection === 'groups' && (
            <>
              <h2>Groups</h2>
              <p>Your groups will be shown here.</p>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
