import MovieCard from '../components/movieCard';
import './groupDetails.css';

export default function GroupDetails() {
  return (
    <section className="group-details-page">
      <aside className="group-details-sidebar">
        <h1>Sci-Fi Lovers Club</h1>
        <p>Created October 2023 · 1 Active Members</p>

        <button type="button" className="button-secondary">
          Delete Group
        </button>

        <section className="group-members">
          <h2>Members & Requests</h2>

          <h3>Join Requests (2)</h3>

          <div className="join-request">
            <span>@Jani</span>

            <div className="join-request__actions">
              <button type="button" className="button-primary">
                Accept
              </button>

              <button type="button" className="button-secondary">
                Reject
              </button>
            </div>
          </div>

          <div className="join-request">
            <span>@Marianna</span>

            <div className="join-request__actions">
              <button type="button" className="button-primary">
                Accept
              </button>

              <button type="button" className="button-secondary">
                Reject
              </button>
            </div>
          </div>

          <h3>Current Members</h3>

          <div className="current-member">
            <span>@Joona</span>
            <span>Admin</span>
          </div>
        </section>
      </aside>

      <section className="group-playlist">
        <h2>Shared Movie Playlist</h2>

        <p>
          These are the titles planned for upcoming group watch sessions.
        </p>

        <div className="movie-grid">
          <MovieCard title="Blade Runner 2049" />
          <MovieCard title="Arrival" />
          <MovieCard title="Dune: Part Two" />
        </div>
      </section>
    </section>
  );
}