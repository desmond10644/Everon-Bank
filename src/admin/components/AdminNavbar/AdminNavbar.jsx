import { useAdminAuth } from "../../Context/useAdminAuth";
import "./AdminNavbar.css";

const AdminNavbar = ({ onMenuClick }) => {
  const { admin, logout } = useAdminAuth();

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          className="admin-menu-btn"
          onClick={onMenuClick}
        >
          ☰
        </button>

        <div className="admin-logo">
          <span>My</span>Bank
          <small>ADMIN</small>
        </div>
      </div>

      <div className="admin-navbar-right">
        <button className="admin-notification-btn">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">
            {admin?.name?.charAt(0) || "A"}
          </div>

          <div className="admin-profile-info">
            <strong>{admin?.name || "Administrator"}</strong>
            <span>{admin?.role || "Admin"}</span>
          </div>
        </div>

        <button
          className="admin-logout-btn"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;