import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./register.css";
import PasswordInput from "../component/passwordinput";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    accountType: "Savings",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const nameParts = form.fullName.trim().split(/\s+/);

    if (nameParts.length < 2) {
      setError("Please enter your first and last name.");
      return;
    }

    try {
      setLoading(true);

      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      const response = await fetch(
        "https://everon-bankbackend.vercel.app/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email: form.email,
            phone: form.phone,
            accountType: form.accountType,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form
        className="register-form"
        onSubmit={handleSubmit}
      >
        <h2>Create Account</h2>

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {success && (
          <p className="success-message">
            {success}
          </p>
        )}

        <label htmlFor="fullName">
          Full Name
        </label>

        <input
          id="fullName"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">
          Email Address
        </label>

        <input
          id="email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">
          Phone Number
        </label>

        <input
          id="phone"
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="accountType">
          Account Type
        </label>

        <select
          id="accountType"
          name="accountType"
          value={form.accountType}
          onChange={handleChange}
          required
        >
          <option value="Savings">
            Savings Account
          </option>

          <option value="Current">
            Current Account
          </option>

          <option value="Business">
            Business Account
          </option>
        </select>

        <label htmlFor="password">
          Password
        </label>

        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label htmlFor="confirmPassword">
          Confirm Password
        </label>

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Register"}
        </button>

        <p>
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;