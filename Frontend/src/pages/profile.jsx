import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, authenticatedFetch, logout } = useAuth();

  const [activeSection, setActiveSection] = useState('rated');
  const [account, setAccount] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
          'http://localhost:5000/api/users/me',
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

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await authenticatedFetch(
        'http://localhost:5000/api/users/me',
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

        <button type="button" className="button-primary">
          Logout
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
                <strong>15</strong>
                <span>Rated titles</span>
              </button>

              <button
                type="button"
                className={`profile-stat ${activeSection === 'favorites' ? 'profile-stat--active' : ''}`}
                onClick={() => setActiveSection('favorites')}
              >
                <strong>8</strong>
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
