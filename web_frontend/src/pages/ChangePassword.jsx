// File: src/pages/ChangePassword.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api';
import SHA256 from 'crypto-js/sha256';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Optional: password strength check
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must be 8+ characters with 1 uppercase, 1 digit, and 1 special character.");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem("full_user"));
    console.log(storedUser);
    const userCode = storedUser?.user_code;

    if (!userCode) {
      toast.error("User session expired. Please login again.");
      navigate("/login");
      return;
    }

    const trimmedOldPassword = oldPassword.trim();
    const hashedOldPassword = trimmedOldPassword === "NIC@2024"
      ? "NIC@2024"
      : SHA256(trimmedOldPassword).toString();

    const payload = {
      user_code: userCode,
      old_password: hashedOldPassword,
      new_password: SHA256(newPassword.trim()).toString(),
    };

    const { data, error } = await changePassword(payload);

    if (error) {
      toast.error(error.message || "Password change failed");
    } else {
      toast.success("Password changed successfully");
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <h2>Change Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>Old Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />

          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="submit-btn">Change Password</button>
        </form>
      </div>
    </div>
  );
}
