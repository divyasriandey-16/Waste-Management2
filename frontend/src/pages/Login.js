import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import logo from "../assets/logo.png";
import foodbg from "../assets/foodbg.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div
      className="login-wrapper"
      style={{ backgroundImage: `url(${foodbg})` }}
    >
      <div className="login-card">

        {/* LOGO */}
        <img src={logo} alt="logo" className="logo" />

        {/* TAGLINE */}
        <p className="tagline">
          🍱 <span className="orange">Share Food.</span>
          <span className="orange"> Save Lives.</span>
        </p>

        <h2>Login</h2>

        {/* ERROR MESSAGE */}
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p className="register-text">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;