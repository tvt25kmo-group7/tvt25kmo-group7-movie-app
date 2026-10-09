import './navBar.css';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import LoginModal from './loginModal';
import RegisterModal from './registerModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';

    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [darkMode]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleProtectedClick(event) {
    closeMenu();
    if (user?.token) {
      return;
    }
    event.preventDefault();
    setActiveModal('login');
  }

  async function handleLogout() {
    const success = await logout();

    if (!success) {
      console.warn('Backend logout failed; local session was cleared');
    }

    closeMenu();
    navigate('/');
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar__content">
          <Link className="navbar__logo" to="/" onClick={closeMenu}>
            Movie App
          </Link>

          <button
            className="navbar__toggle"
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            Menu
          </button>

          <div
            id="main-navigation"
            className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}
          >
            <Link to="/" onClick={closeMenu}>
              Home
            </Link>

            <Link to={'/groups'} onClick={closeMenu}>
              Groups
            </Link>

            <Link to={`/favorites`} onClick={handleProtectedClick}>
              Favorites
            </Link>

            {user ?
              <>
                <Link
                  to="/profile"
                  className="navbar__profile"
                  aria-label={`Open profile for ${user.username}`}
                  title={`Open profile for ${user.username}`}
                  onClick={closeMenu}
                >
                  {user.username?.charAt(0).toUpperCase()}
                </Link>

                <button
                  type="button"
                  className="button-secondary"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            : <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setActiveModal('login');
                  closeMenu();
                }}
              >
                Login
              </button>
            }

            <button
              type="button"
              className="navbar__theme-toggle"
              aria-label={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              aria-pressed={darkMode}
              title={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              onClick={() => setDarkMode(currentMode => !currentMode)}
            >
              <span aria-hidden="true">
                {darkMode ? '☾' : '☀'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {activeModal === 'login' && (
        <LoginModal
          onClose={() => setActiveModal(null)}
          onOpenRegister={() => setActiveModal('register')}
        />
      )}

      {activeModal === 'register' && (
        <RegisterModal
          onClose={() => setActiveModal(null)}
          onOpenLogin={() => setActiveModal('login')}
        />
      )}
    </>
  );
}
