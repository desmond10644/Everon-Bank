import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const nav = [
    ["/dashboard", "Dashboard"],
    ["/accounts", "Accounts"],
    ["/transactions", "Transactions"],
    ["/transfer", "Transfer"],
    ["/cards", "Cards"],
    ["/loans", "Loans"],
    ["/investments", "Investments"],
    ["/settings", "Settings"],
    ["/profile", "Profile"],
  ];

  return (
    <nav className="sidebar card" role="navigation" aria-label="Main navigation">
      <h3 className="sidebar-title">MyBank</h3>

      <ul className="sidebar-list">
        {nav.map(([to, label]) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;