import React from "react";
import "./AdminButton.css";

const AdminButton = ({
  children,
  variant = "primary",
  onClick,
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={`admin-button ${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default AdminButton;