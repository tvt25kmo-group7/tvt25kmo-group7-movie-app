import { useState } from 'react';
import './modal.css';
import './registerModal.css';

export default function RegisterModal({ onClose, onOpenLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      onOpenLogin();
    } catch (error) {
      console.error('Registration request failed:', error);
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  }

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

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <p className="register-error">{error}</p>}

          <button
            type="submit"
            className="button-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
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