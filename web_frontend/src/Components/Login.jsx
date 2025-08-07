import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/api";
import "../css/Login.css";
import CryptoJS from "crypto-js";


export default function Login() {
  const navigate = useNavigate();

  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hashedPassword = CryptoJS.SHA256(password).toString();


    const credentials = {
      user_name: emailOrMobile,
      password:hashedPassword,
    };

    const { data, error } = await loginUser(credentials);

    if (error) {
      toast.error(error.message || "Invalid credentials");
    } else {
      const user = data.user;
       // ✅ Store session data
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user_code", user.user_code);
      localStorage.setItem("role_code", user.role_code);
      localStorage.setItem("user_level_code", user.user_level_code);
      localStorage.setItem("state_code", user.state_code || "");
      localStorage.setItem("division_code", user.division_code || "");
      localStorage.setItem("district_code", user.district_code || "");
      localStorage.setItem("taluka_code", user.taluka_code || "");
      localStorage.setItem("department_name", user.department_name || "");
      localStorage.setItem("full_user", JSON.stringify(user)); // optional
      // Check if first login (NIC@2024 hashed check already done in backend)
      if (data.force_password_change) {
        toast.info("First login detected. Please change your password.");
        // Optionally redirect to change-password page
        navigate("/change-password");
        return;
      }

     

      toast.success("Login successful");
      navigate("/");
    }
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
          <input
            type="text"
            placeholder="Enter email or mobile number"
            value={emailOrMobile}
            onChange={(e) => setEmailOrMobile(e.target.value)}
            required
          />

          <label>
            Password<span className="required">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
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
