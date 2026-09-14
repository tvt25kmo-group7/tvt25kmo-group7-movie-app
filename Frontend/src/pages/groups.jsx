import { useState } from 'react';

import CreateGroupModal from '../components/createGroupModal';

import './groups.css';

export default function Groups() {
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

  return (
    <>
      <section className="groups-page">
        <div className="groups-header">
          <div>
            <h1>Movie Groups</h1>
            <p>
              Join groups with friends to share, watch, and rank movies together.
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
          <article className="group-card">
            <div className="group-card__header">
              <h2>uuno turhapuurot</h2>
              <span>12 members</span>
            </div>

            <p>
              mitäs tänne
            </p>

            <button type="button" className="button-secondary">
              Join Group
            </button>
          </article>

          <article className="group-card">
            <div className="group-card__header">
              <h2>Komedia pläjäys</h2>
              <span>8 members</span>
            </div>

            <p>
              jotain hauskaa
            </p>

            <button type="button" className="button-secondary">
              Join Group
            </button>
          </article>

          <article className="group-card">
            <div className="group-card__header">
              <h2>Kamalaa kauhua</h2>
              <span>4 members</span>
            </div>

            <p>
              Ei nössöille.
            </p>

            <button type="button" className="button-secondary">
              Join Group
            </button>
          </article>

          <article className="group-card">
            <div className="group-card__header">
              <h2>Kissa videot</h2>
              <span>6 members</span>
            </div>

            <p>
              Hienoja kisuja ja kisuvideoita katsellaan ja jaetaan. xdd
            </p>

            <button type="button" className="button-secondary">
              Join Group
            </button>
          </article>
        </div>
      </section>

      {createGroupModalOpen && (
        <CreateGroupModal
          onClose={() => setCreateGroupModalOpen(false)}
        />
      )}
    </>
  );
}