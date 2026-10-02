import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import './groupDetails.css';

export default function GroupDetails() {
  const { id } = useParams();
  const { user, authLoading, authenticatedFetch } = useAuth();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) {
      return;
    }
    async function fetchGroup() {
      try {
        const response =
          user ?
            await authenticatedFetch(`/api/groups/${id}`)
          : await fetch(`/api/groups/${id}`);

        if (response.status === 404) {
          throw new Error('Group not found');
        }

        if (!response.ok) {
          throw new Error('Group could not be loaded');
        }

        const data = await response.json();
        setGroup(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGroup();
  }, [id, user, authLoading, authenticatedFetch]);

  if (loading) {
    return <p>Loading group...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>Log in to request to join this group</p>
        </aside>
      </section>
    );
  }

  if (!group.isOwner && group.membershipStatus === null) {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>You are not a member of this group</p>
          <button type="button">Request to Join</button>
        </aside>
      </section>
    );
  }

  if (!group.isOwner && group.membershipStatus === 'member') {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>You are a member of this group</p>
          <button type="button" className="button-danger">
            Leave Group
          </button>
          <section>
            <h3>Current Members</h3>
          </section>
        </aside>
      </section>
    );
  }

  if (group.isOwner) {
    return (
      <section className="group-details-page">
        <aside className="group-details-sidebar">
          <h1>{group.name}</h1>
          <p>You are the creator of this group</p>
          <button type="button" className="button-danger">
            Delete Group
          </button>
          {group.isOwner && (
            <section>
              <h3>Join Requests</h3>
            </section>
          )}
          <section>
            <h3>Current Members</h3>
          </section>
        </aside>
      </section>
    );
  }

  return (
    <section className="group-details-page">
      <aside className="group-details-sidebar">
        <h1>{group.name}</h1>
      </aside>
    </section>
  );
}
