import React from "react";
import "./StatusBadge.css";

const StatusBadge = ({ status }) => {
  const value = String(status || "").toLowerCase();

  let className = "status-badge";

  if (
    value === "active" ||
    value === "completed" ||
    value === "approved" ||
    value === "success"
  ) {
    className += " success";
  } else if (
    value === "pending" ||
    value === "processing"
  ) {
    className += " warning";
  } else if (
    value === "failed" ||
    value === "rejected" ||
    value === "suspended"
  ) {
    className += " danger";
  } else {
    className += " neutral";
  }

  return (
    <span className={className}>
      {status}
    </span>
  );
};

export default StatusBadge;