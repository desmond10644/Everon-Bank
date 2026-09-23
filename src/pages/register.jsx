import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./register.css";
import PasswordInput from "../component/passwordinput";

import "./register.css";


function Register() {

  const navigate = useNavigate();


  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });


  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");



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

    setSuccess("");


    // Check passwords

    if (
      form.password !==
      form.confirmPassword
    ) {

      setError(
        "Passwords do not match!"
      );

      return;

    }


    try {

      setLoading(true);


      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            password: form.password,
          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.message ||
          "Registration failed"
        );

        return;

      }


      setSuccess(
        "Registration successful! Redirecting to login..."
      );


      setTimeout(() => {

        navigate("/login");

      }, 1500);


    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server."
      );

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

          <h2>
            Create Account
          </h2>


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
            placeholder="Full Name"
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
            placeholder="Email Address"
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
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />



          <label htmlFor="password">
            Password
          </label>

          <PasswordInput
            id="password"
            name="password"
            placeholder="Password"
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
            placeholder="Confirm Password"
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