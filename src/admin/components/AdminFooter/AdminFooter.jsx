import React from "react";
import "./AdminFooter.css";

const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <p>
        © {new Date().getFullYear()} MyBank Admin Panel.
        All rights reserved.
      </p>

      <p>Secure Banking Administration</p>
    </footer>
  );
};

export default AdminFooter;