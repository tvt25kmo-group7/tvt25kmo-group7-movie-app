import { useState } from 'react';
import './profile.css';

export default function Profile() {
  const [activeSection, setActiveSection] = useState('rated');

  return (
    <section className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Joona</h1>
          <p>@Joona · plääplää jotakin</p>
        </div>

        <button type="button" className="button-primary">
          Sign Out
        </button>
      </div>

      <div className="profile-layout">
        <div className="profile-left">
          <section className="profile-card">
            <h2>Your movie life</h2>

            <div className="profile-stats">
              <button
                type="button"
                className={`profile-stat ${activeSection === 'rated' ? 'profile-stat--active' : ''}`}
                onClick={() => setActiveSection('rated')}
              >
                <strong>128</strong>
                <span>Rated titles</span>
              </button>

              <button
                type="button"
                className={`profile-stat ${activeSection === 'favorites' ? 'profile-stat--active' : ''}`}
                onClick={() => setActiveSection('favorites')}
              >
                <strong>36</strong>
                <span>Favorites</span>
              </button>

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
              <span>joona@example.com</span>
            </div>

            <button type="button" className="button-secondary">
              Delete Account
            </button>
          </section>
        </div>

        <section className="profile-content-panel">
          {activeSection === 'rated' && (
            <>
              <h2>Rated titles</h2>
              <p>Your rated movies and series will be shown here.</p>
            </>
          )}

          {activeSection === 'favorites' && (
            <>
              <h2>Favorites</h2>
              <p>Your favorite movies and series will be shown here.</p>
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