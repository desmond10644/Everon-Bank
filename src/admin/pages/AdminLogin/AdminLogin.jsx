import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../Context/useAdminAuth";
import PasswordInput from "../../../component/passwordinput";
import "./AdminLogin.css";
const AdminLogin = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const result = await login(form.email, form.password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <span>My</span>Bank
          <small>ADMIN PORTAL</small>
        </div>

        <h1>Admin Login</h1>

        <p>
          Sign in to access the MyBank administration
          panel.
        </p>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Administrator email"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Password</label>

            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
          >
            Login to Admin Panel
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;