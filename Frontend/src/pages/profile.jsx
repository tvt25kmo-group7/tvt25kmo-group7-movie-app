export default function Profile() {
  return (
    <section className="profile-page">
      <header className="profile-header">
        <div>
          <h1>Joona</h1>
          <p>@Joona · Helsinki, Finland</p>
        </div>

        <button type="button">
          Sign Out
        </button>
      </header>

      <div className="profile-content">
        <section className="profile-card">
          <h2>Your movie life</h2>

          <div>
            <div>
              <strong>128</strong>
              <span>Rated titles</span>
            </div>

            <div>
              <strong>36</strong>
              <span>Favorites</span>
            </div>

            <div>
              <strong>4</strong>
              <span>Groups</span>
            </div>
          </div>

          <p>
            Member since <strong>October 2023</strong>
          </p>
        </section>

        <section className="profile-card">
          <h2>Account</h2>

          <p>
            Email <span>joona@example.com</span>
          </p>

          <button type="button">
            Delete Account
          </button>
        </section>
      </div>
    </section>
  );
}