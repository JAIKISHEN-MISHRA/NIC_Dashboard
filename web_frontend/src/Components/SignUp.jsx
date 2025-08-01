import React from "react";
import "../css/Login.css";

export default function SignUp() {
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
        <h2 className="login-title">SignUp</h2>
        <form className="form">
          <label>First name<span className="required">*</span></label>
          <input type="text" placeholder="Enter email or mobile number" />

          <label>Middle name<span className="required">*</span></label>
          <input type="text" placeholder="Enter email or mobile number" />

           <label>Last name<span className="required">*</span></label>
          <input type="text" placeholder="Enter email or mobile number" />

          <label>Email<span className="required">*</span></label>
          <input type="text" placeholder="Enter email or mobile number" />

          <label>Mobile number<span className="required">*</span></label>
          <input type="text" placeholder="Enter email or mobile number" />

          <label>Password<span className="required">*</span></label>
          <input type="password" placeholder="Enter password" />

           <label>Confirm Password<span className="required">*</span></label>
          <input type="password" placeholder="Enter password" />

          {/* <a href="#" className="forgot">Forgot your password?</a> */}

          <button type="submit" className="submit-btn">SignUp</button>
        </form>
      </div>

      {/* Footer */}
      <div className="footer">
        {/* <p>WELCOME TO</p>
        <h3>Pradhan Mantri Yojana</h3> */}
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </div>
    </div>
  );
}
