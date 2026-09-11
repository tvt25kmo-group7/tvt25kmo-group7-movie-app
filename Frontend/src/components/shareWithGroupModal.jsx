import './modal.css';
import './shareWithGroupModal.css';

export default function ShareWithGroupModal({
  onClose,
  onOpenCreateGroup,
}) {
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

        <p>Choose one of your groups to share this movie.</p>

        <div className="share-group-list">
          <button type="button">
            Kissa videot
          </button>

          <button type="button">
            Komedia pläjäys
          </button>
        </div>

        <button
          type="button"
          className="button-primary"
        >
          Share
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