import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({ open, onClose }) => {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: "📊",
    },
    {
      title: "Users",
      path: "/admin/users",
      icon: "👥",
    },
    {
      title: "Accounts",
      path: "/admin/accounts",
      icon: "🏦",
    },
    {
      title: "Transactions",
      path: "/admin/transactions",
      icon: "💳",
    },
    {
      title: "Transfers",
      path: "/admin/transfers",
      icon: "💸",
    },
    {
      title: "Cards",
      path: "/admin/cards",
      icon: "💳",
    },
    {
      title: "Loans",
      path: "/admin/loans",
      icon: "🏠",
    },
    {
      title: "Investments",
      path: "/admin/investments",
      icon: "📈",
    },
    {
      title: "Notifications",
      path: "/admin/notifications",
      icon: "🔔",
    },
    {
      title: "Reports",
      path: "/admin/reports",
      icon: "📑",
    },
    {
      title: "Admin Users",
      path: "/admin/admin-users",
      icon: "🛡️",
    },
    {
      title: "Settings",
      path: "/admin/settings",
      icon: "⚙️",
    },
  ];

  return (
    <>
      {open && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
        />
      )}

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-title">
          ADMIN PANEL
        </div>

        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                `admin-sidebar-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;