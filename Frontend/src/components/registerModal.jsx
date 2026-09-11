import './modal.css';
import './registerModal.css';

export default function RegisterModal({ onClose, onOpenLogin }) {
  return (
    <div className="modal-overlay">
      <div className="register-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          Close
        </button>

        <h2>Register</h2>

        <form>
          <div>
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Enter password"
            />
          </div>

          <button
            type="button"
            className="button-primary"
          >
            Create Account
          </button>
        </form>

        <p>
          Already have an account?{' '}
          <button
            type="button"
            className="modal-secondary-button"
            onClick={onOpenLogin}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}