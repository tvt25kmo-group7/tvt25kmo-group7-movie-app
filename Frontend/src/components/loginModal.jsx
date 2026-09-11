import './loginModal.css';
import './modal.css';

export default function LoginModal({ onClose, onOpenRegister }) {
  return (
    <div className="modal-overlay">
      <div className="login-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close login"
        >
          Close
        </button>

        <h2>Login</h2>

        <form>
          <div>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="button" className="button-primary">
            Login
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <button 
          type="button"
           className="modal-secondary-button"
           onClick={onOpenRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}