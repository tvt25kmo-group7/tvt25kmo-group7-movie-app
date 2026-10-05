import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import './modal.css';
import './createGroupModal.css';

export default function CreateGroupModal({
  onClose,
  onCreated,
}) {
  const { authenticatedFetch } = useAuth();

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Enter a name for the group.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await authenticatedFetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          responseData.error || 'Group could not be created',
        );
      }

      onCreated?.(responseData);
      onClose();
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="create-group-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          disabled={submitting}
        >
          Close
        </button>

        <h2>Create New Group</h2>

        <p>Start a new movie group and invite your friends.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="group-name">
            Group Name
          </label>

          <input
            id="group-name"
            type="text"
            placeholder="Enter a group name"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={100}
            autoFocus
            required
          />

          {error && (
            <p
              className="create-group-modal__error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button-primary"
            disabled={submitting || !name.trim()}
          >
            {submitting ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}