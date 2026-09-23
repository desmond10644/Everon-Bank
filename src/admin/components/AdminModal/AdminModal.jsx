import React from "react";
import "./AdminModal.css";

const AdminModal = ({
  open,
  title,
  children,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>{title}</h3>

          <button onClick={onClose}>
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;