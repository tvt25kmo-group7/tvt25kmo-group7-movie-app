export default function Groups() {
  return (
    <section className="groups-page">
      <div className="groups-header">
        <div>
          <h1>Movie Groups</h1>
          <p>
            Join groups with friends to share, watch, and rank movies together.
          </p>
        </div>

        <button type="button">
          + Create New Group
        </button>
      </div>

      <div className="groups-grid">
        <article className="group-card">
          <div className="group-card__header">
            <h2>Sci-Fi Lovers Club</h2>
            <span>12 members</span>
          </div>

          <p>
            Weekly discussions on space opera, cyber punk, and alternate histories.
          </p>

          <button type="button">
            Join Group
          </button>
        </article>

        <article className="group-card">
          <div className="group-card__header">
            <h2>Classic Cinema Collective</h2>
            <span>8 members</span>
          </div>

          <p>
            Deep dives into pre-1960 masterpieces, auteur theory, and film noir.
          </p>

          <button type="button">
            Join Group
          </button>
        </article>

        <article className="group-card">
          <div className="group-card__header">
            <h2>Friday Night Thrillers</h2>
            <span>4 members</span>
          </div>

          <p>
            For the brave ones who stay psychological thrillers and midnight jumpscares.
          </p>

          <button type="button">
            Join Group
          </button>
        </article>

        <article className="group-card">
          <div className="group-card__header">
            <h2>Auteur & Art-house Cinephiles</h2>
            <span>24 members</span>
          </div>

          <p>
            Appreciations of surrealism, independent releases, and foreign cinema.
          </p>

          <button type="button">
            Join Group
          </button>
        </article>
      </div>
    </section>
  );
}