import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("loggedIn", "true");
    navigate("/");
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="logo-group">
          <img src="/logo.png" alt="India Logo" className="logo" />
          <div className="gov-text">
            <p className="hindi">महाराष्ट्र शासन</p>
            <p className="english">Government of Maharashtra</p>
          </div>
        </div>
        <div className="right-controls">
          <span className="lang">अ</span>
          <span className="lang">A</span>
          <span className="access">🔘</span>
        </div>
      </div>

      {/* Login Box */}
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Username<span className="required">*</span>
          </label>
          <input type="text" placeholder="Enter email or mobile number" required />

          <label>
            Password<span className="required">*</span>
          </label>
          <input type="password" placeholder="Enter password" required />

          <div className="login-links">
            <a href="#" className="forgot">Forgot your password?</a>
          </div>

          <button type="submit" className="submit-btn">Login</button>

          <div className="signup-link">
            <p>
              Don’t have an account?{" "}
              <span
                className="create-link"
                onClick={() => navigate("/signup")}
                style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
              >
                Create one
              </span>
            </p>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="footer">
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </div>
    </div>
  );
}
