import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import "./navbar.css";
import ThemeToggle from "./ui/ThemeToggle";

function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();

  useEffect(() => {
    const u = localStorage.getItem("user");
    try {
      setUser(u ? JSON.parse(u) : null);
    } catch (e) {
      setUser(null);
    }
  }, []);


  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">MyBank</Link>
      </div>

      <div className="nav-actions" ref={menuRef}>
        <ThemeToggle />
        {!user ? (
          <div className="auth-links">
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="register-btn">
              Register
            </Link>
          </div>
        ) : (
          <div className="user-menu">
            <button className="user-button" onClick={() => setOpen((s) => !s)}>
              <span className="avatar">{(user.name || user.email || "")[0]}</span>
              <span className="username">{user.name || user.email}</span>
            </button>

            {open && (
              <div className="user-dropdown">
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;