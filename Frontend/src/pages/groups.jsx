import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CreateGroupModal from '../components/createGroupModal';

import './groups.css';

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/groups');

        if (!response.ok) {
          throw new Error('Group list could not be loaded');
        }

        const data = await response.json();
        setGroups(data);
      } catch (fetchError) {
        setError(fetchError.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  const handleGroupCreated = group => {
    navigate(`/groups/${group.id}`);
  };

  return (
    <>
      <section className="groups-page">
        <div className="groups-header">
          <div>
            <h1>Movie Groups</h1>
            <p>
              Join groups with friends to share, watch, and rank movies
              together.
            </p>
          </div>

          {user?.token && (
            <button
              type="button"
              className="button-primary"
              onClick={() => setCreateGroupModalOpen(true)}
            >
              + Create New Group
            </button>
          )}
        </div>

        <div className="groups-grid">
          {loading && <p>Loading groups...</p>}

          {error && <p role="alert">{error}</p>}

          {!loading && !error && groups.length === 0 && (
            <p>No groups available.</p>
          )}

          {!loading &&
            !error &&
            groups.map(group => (
              <Link
                to={`/groups/${group.id}`}
                className="group-card-link"
                key={group.id}
              >
                <article className="group-card">
                  <h2>{group.name}</h2>
                </article>
              </Link>
            ))}
        </div>
      </section>

      {createGroupModalOpen && (
        <CreateGroupModal
          onClose={() => setCreateGroupModalOpen(false)}
          onCreated={handleGroupCreated}
        />
      )}
    </>
  );
}