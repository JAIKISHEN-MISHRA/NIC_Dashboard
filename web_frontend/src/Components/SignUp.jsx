import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../css/Login.css";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  submitSignup,
} from "../services/api"; // Import from your new api.jsx
import SHA256 from 'crypto-js/sha256';


export default function SignUp() {
  const [formData, setFormData] = useState({
    fname: "",
    mname: "",
    lname: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    state: "",
    division: "",
    district: "",
    taluka: "",
  });

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(true);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(passwordRegex.test(value));
    }

    if (name === "confirmPassword" || name === "password") {
      const newPass = name === "password" ? value : formData.password;
      const confirmPass = name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(newPass === confirmPass);
    }

    if (name === "state") {
      setFormData((prev) => ({ ...prev, division: "", district: "", taluka: "" }));
      setDivisions([]);
      setDistricts([]);
      setTalukas([]);
      fetchDivisions(value);
    }

    if (name === "division") {
      setFormData((prev) => ({ ...prev, district: "", taluka: "" }));
      setDistricts([]);
      setTalukas([]);
      fetchDistricts(formData.state, value);
    }

    if (name === "district") {
      setFormData((prev) => ({ ...prev, taluka: "" }));
      setTalukas([]);
      fetchTalukas(formData.state, formData.division, value);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.fname || !formData.email || !formData.password || !formData.confirmPassword) {
    toast.error("Please fill all required fields.");
    return;
  }

  if (!passwordStrength) {
    toast.error("Password must include 1 uppercase, 1 digit, 1 special character and be at least 8 characters.");
    return;
  }

  if (!passwordMatch) {
    toast.error("Passwords do not match.");
    return;
  }

  const { confirmPassword, ...rest } = formData;
  const encryptedPassword = SHA256(formData.password).toString();
  let payload = {
    ...rest,
    password: encryptedPassword,
  };

  const { data, error } = await submitSignup(payload);
  if (error) {
    toast.error("Signup failed.");
  } else {
    toast.success("Signup request submitted! Awaiting admin approval.");
  }
};


  // Fetch initial state list
  useEffect(() => {
    const loadStates = async () => {
      const { data, error } = await getStates();
      if (data) setStates(data);
      else toast.error("Failed to load states.");
    };
    loadStates();
  }, []);

  const fetchDivisions = async (stateCode) => {
    const { data, error } = await getDivisions(stateCode);
    if (data) setDivisions(data);
    else toast.error("Failed to load divisions.");
  };

  const fetchDistricts = async (stateCode, divisionCode) => {
    const { data, error } = await getDistricts(stateCode, divisionCode);
    if (data) setDistricts(data);
    else toast.error("Failed to load districts.");
  };

  const fetchTalukas = async (stateCode, divisionCode, districtCode) => {
    const { data, error } = await getTalukas(stateCode, divisionCode, districtCode);
    if (data) setTalukas(data);
    else toast.error("Failed to load talukas.");
  };

  return (
    <div className="container">
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

      <div className="login-box">
        <h2 className="login-title">Sign Up</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>First name<span className="required">*</span></label>
          <input name="fname" value={formData.fname} onChange={handleChange} required />

          <label>Middle name</label>
          <input name="mname" value={formData.mname} onChange={handleChange} />

          <label>Last name</label>
          <input name="lname" value={formData.lname} onChange={handleChange} />

          <label>Email<span className="required">*</span></label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Mobile number</label>
          <input name="mobile" value={formData.mobile} onChange={handleChange} />

          <label>Password<span className="required">*</span></label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          {!passwordStrength && (
            <p className="error-text">Must be 8+ chars, 1 uppercase, 1 number, 1 special char</p>
          )}

          <label>Confirm Password<span className="required">*</span></label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          {!passwordMatch && <p className="error-text">Passwords do not match</p>}

          <label>State</label>
          <select name="state" value={formData.state} onChange={handleChange}>
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s.state_code} value={s.state_code}>
                {s.state_name}
              </option>
            ))}
          </select>

          <label>Division</label>
          <select name="division" value={formData.division} onChange={handleChange} disabled={!formData.state}>
            <option value="">Select Division</option>
            {divisions.map((d) => (
              <option key={d.division_code} value={d.division_code}>
                {d.division_name}
              </option>
            ))}
          </select>

          <label>District</label>
          <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.division}>
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.district_code} value={d.district_code}>
                {d.district_name}
              </option>
            ))}
          </select>

          <label>Taluka</label>
          <select name="taluka" value={formData.taluka} onChange={handleChange} disabled={!formData.district}>
            <option value="">Select Taluka</option>
            {talukas.map((t) => (
              <option key={t.taluka_code} value={t.taluka_code}>
                {t.taluka_name}
              </option>
            ))}
          </select>

          <button type="submit" className="submit-btn">Sign Up</button>
        </form>
      </div>

      <div className="footer">
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </div>
    </div>
  );
}
