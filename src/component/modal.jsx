import "./Modal.css";

function Modal({ show, title, children, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">

        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}

export default Modal;