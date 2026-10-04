import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import './modal.css';
import './shareWithGroupModal.css';

export default function ShareWithGroupModal({
  movieId,
  mediaType,
  onClose,
  onOpenCreateGroup,
}) {
  const { authenticatedFetch } = useAuth();

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchUserGroups() {
      try {
        const response = await authenticatedFetch('/api/groups/mine');
        const data = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(
            data.error || 'Groups could not be loaded',
          );
        }

        setGroups(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserGroups();
  }, [authenticatedFetch]);

  const handleShare = async () => {
    if (!selectedGroupId) {
      setError('Choose a group first.');
      return;
    }

    setSharing(true);
    setError('');
    setSuccess('');

    try {
      const response = await authenticatedFetch(
        `/api/groups/${selectedGroupId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tmdbId: Number(movieId),
            mediaType,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setError(
          data.error || 'This title is already in the group.',
        );
        return;
      }

      if (response.status === 403) {
        setError(
          data.error || 'You are not a member of this group.',
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || 'The title could not be shared.',
        );
      }

      setSuccess('The title was shared with the group.');
    } catch (error) {
      setError(error.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="share-group-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          Close
        </button>

        <h2>Share With Group</h2>

        <p>Choose one of your groups to share this title.</p>

        {loading && <p>Loading groups...</p>}

        {!loading && groups.length === 0 && (
          <p>You are not a member of any groups yet.</p>
        )}

        {!loading && groups.length > 0 && (
          <div className="share-group-list">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                className={
                  selectedGroupId === group.id ? 'is-selected' : ''
                }
                aria-pressed={selectedGroupId === group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setError('');
                  setSuccess('');
                }}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <button
          type="button"
          className="button-primary"
          disabled={
            loading ||
            sharing ||
            !selectedGroupId
          }
          onClick={handleShare}
        >
          {sharing ? 'Sharing...' : 'Share'}
        </button>

        <button
          type="button"
          className="button-secondary"
          onClick={onOpenCreateGroup}
        >
          Create a new group
        </button>
      </div>
    </div>
  );
}