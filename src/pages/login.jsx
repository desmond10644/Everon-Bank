import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PasswordInput from "../component/passwordinput";

import "./login.css";
import { login as loginService } from "../services/authservice";


function Login() {

  const navigate = useNavigate();

  const auth = useAuth();


  const [form, setForm] = useState({
    email: "",
    password: "",
  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");



  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };



  const handleSubmit = async (e) => {

    e.preventDefault();


    setError("");

    setLoading(true);


    try {
      const data = await loginService(form);

      if (!data || !data.token) {
        setError(data?.message || "Login failed");
        return;
      }

      // Persist via AuthContext
      auth.login({ user: data.user, token: data.token });

      if (data.user?.role === "admin" || data.user?.role === "super_admin") {
        localStorage.setItem("mybank_admin", JSON.stringify({
          id: data.user.id,
          name: data.user.fullName,
          email: data.user.email,
          role: data.user.role,
        }));
        localStorage.setItem("mybank_admin_token", data.token);
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }

  };



  return (
      <div className="login-page">

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <h2>
            Login
          </h2>


          {error && (
            <p className="error-message">
              {error}
            </p>
          )}



          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            placeholder="Email Address"
            onChange={handleChange}
            required
          />



          <label htmlFor="password">
            Password
          </label>

          <PasswordInput
            id="password"
            name="password"
            value={form.password}
            placeholder="Password"
            onChange={handleChange}
            required
          />



          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>



          <p>

            Don't have an account?{" "}

            <Link to="/register">
              Register
            </Link>

          </p>

        </form>

      </div>

  );
}


export default Login;