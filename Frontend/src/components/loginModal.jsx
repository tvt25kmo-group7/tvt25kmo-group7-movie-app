import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './loginModal.css';
import './modal.css';

export default function LoginModal({ onClose, onOpenRegister }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      login(data);

      onClose();
    } catch (error) {
      console.error('Login request failed:', error);
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  }

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

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="button-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p>
          Don't have an account?{' '}
          <button
            type="button"
            className="modal-secondary-button"
            onClick={onOpenRegister}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}