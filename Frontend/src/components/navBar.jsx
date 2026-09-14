import './navBar.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import LoginModal from './loginModal';
import RegisterModal from './registerModal';

export default function Navbar() {
  const [activeModal, setActiveModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar__content">
          <Link
            className="navbar__logo"
            to="/"
            onClick={closeMenu}
          >
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

            <Link to="/groups" onClick={closeMenu}>
              Groups
            </Link>

            <Link to="/favorites" onClick={closeMenu}>
              Favorites
            </Link>

            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setActiveModal('login');
                closeMenu();
              }}
            >
              Login
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