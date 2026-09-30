import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CreateGroupModal from '../components/createGroupModal';
import './groups.css';

export default function Groups() {
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
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

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

          <button
            type="button"
            className="button-primary"
            onClick={() => setCreateGroupModalOpen(true)}
          >
            + Create New Group
          </button>
        </div>

        <div className="groups-grid">
          {loading && <p>Loading groups...</p>}

          {error && <p>{error}</p>}

          {!loading && !error && groups.length === 0 && (
            <p>No groups available.</p>
          )}

          {!loading &&
            !error &&
            groups.map((group) => (
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
        <CreateGroupModal onClose={() => setCreateGroupModalOpen(false)} />
      )}
    </>
  );
}
