import React, { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/api";
import CryptoJS from "crypto-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/Login.css";
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);

  const isDisabled = useMemo(
    () => !emailOrMobile.trim() || !password.trim() || loading,
    [emailOrMobile, password, loading]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setProgress(true);

      try {
        const hashedPassword = CryptoJS.SHA256(password).toString();

        const credentials = {
          user_name: emailOrMobile,
          password: hashedPassword,
        };

        const { data, error } = await loginUser(credentials);

        if (error) {
          toast.error(error.message || "Invalid credentials");
          // trigger shake animation
          if (boxRef.current) {
            boxRef.current.classList.add("shake");
            setTimeout(() => {
              boxRef.current.classList.remove("shake");
            }, 300);
          }
        } else {
          const user = data.user;
          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("user_code", user.user_code);
          localStorage.setItem("role_code", user.role_code);
          localStorage.setItem("user_level_code", user.user_level_code);
          localStorage.setItem("state_code", user.state_code || "");
          localStorage.setItem("division_code", user.division_code || "");
          localStorage.setItem("district_code", user.district_code || "");
          localStorage.setItem("taluka_code", user.taluka_code || "");
          localStorage.setItem("department_name", user.department_name || "");
          localStorage.setItem("full_user", JSON.stringify(user));

          if (data.force_password_change) {
            toast.info("First login detected. Please change your password.");
            navigate("/change-password");
            return;
          }

          toast.success("Login successful 🎉");
          setTimeout(() => navigate("/"), 800);
        }
      } catch {
        toast.error("Something went wrong, try again.");
      } finally {
        setLoading(false);
        setTimeout(() => setProgress(false), 400); // hide progress bar after short delay
      }
    },
    [emailOrMobile, password, navigate]
  );

  return (
    <div className="container">
      {/* Progress bar */}
      {progress && <div className="progress-bar"></div>}

      {/* Header */}
      <div className="header">
        <div className="logo-group">
<Link to="/">
  <img src="/logo.png" alt="India Logo" className="logo" />
</Link>          <div className="gov-text">
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
      <div ref={boxRef} className="login-box">
        <h2 className="login-title">Login</h2>
        <form className="form" onSubmit={handleSubmit}>
          {/* Username */}
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

          {/* Password */}
          <label>
            Password<span className="required">*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: "35px" }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#555",
              }}
            >
              {showPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>

          {/* Forgot password */}
          <a href="#" className="forgot">Forgot your password?</a>

          {/* Submit button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={isDisabled}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Signup link */}
          <div className="signup-link">
            <p>
              Don’t have an account?{" "}
              <span
                className="create-link"
                onClick={() => navigate("/signup")}
                style={{
                  color: "#007bff",
                  cursor: "pointer",
                  textDecoration: "underline",
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
