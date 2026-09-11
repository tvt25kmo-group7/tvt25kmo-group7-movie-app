import { useState } from 'react';
import { Link } from 'react-router-dom';

import LoginModal from './loginModal';
import RegisterModal from './registerModal';

export default function Navbar() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <>
      <nav className="navbar">
        <div className="navbar__content">
          <Link className="navbar__logo" to="/">
            Movie App
          </Link>

          <div className="navbar__links">
            <Link to="/">Home</Link>
            <Link to="/groups">Groups</Link>
            <Link to="/favorites">Favorites</Link>

            <button
              type="button"
              onClick={() => setActiveModal('login')}
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