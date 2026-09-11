export default function LoginModal({ onClose, onOpenRegister }) {
  return (
    <div className="modal-overlay">
      <div className="login-modal">
        <button type="button" onClick={onClose}>
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

          <button type="button">
            Login
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <button type="button" onClick={onOpenRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}