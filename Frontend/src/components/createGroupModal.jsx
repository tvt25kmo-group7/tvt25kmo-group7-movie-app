import './modal.css';
import './createGroupModal.css';

export default function CreateGroupModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="create-group-modal">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          Close
        </button>

        <h2>Create New Group</h2>

        <p>Start a new movie group and invite your friends.</p>

        <label htmlFor="group-name">
          Group Name
        </label>

        <input
          id="group-name"
          type="text"
          placeholder="keksi hyvä nimi"
        />

        <button
          type="button"
          className="button-primary"
        >
          Create Group
        </button>
      </div>
    </div>
  );
}