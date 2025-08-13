import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import "../css/SignUp.css";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  submitSignup,
} from "../services/api";
import SHA256 from "crypto-js/sha256";
import { Link } from "react-router-dom";


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
    department: "",
  });

  // option lists
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  // UI / validation
  const [onboardMode, setOnboardMode] = useState("location");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // loading flags
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Fetch helpers (memoized)
  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDivisions(true);
    const { data, error } = await getDivisions(stateCode);
    setLoadingDivisions(false);
    if (data) setDivisions(data);
    else {
      setDivisions([]);
      toast.error("Failed to load divisions.");
    }
  }, []);

  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return;
    setLoadingDistricts(true);
    const { data, error } = await getDistricts(stateCode, divisionCode);
    setLoadingDistricts(false);
    if (data) setDistricts(data);
    else {
      setDistricts([]);
      toast.error("Failed to load districts.");
    }
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return;
    setLoadingTalukas(true);
    const { data, error } = await getTalukas(stateCode, divisionCode, districtCode);
    setLoadingTalukas(false);
    if (data) setTalukas(data);
    else {
      setTalukas([]);
      toast.error("Failed to load talukas.");
    }
  }, []);

  // load states on mount
  useEffect(() => {
    (async () => {
      setLoadingStates(true);
      const { data, error } = await getStates();
      setLoadingStates(false);
      if (data) setStates(data);
      else toast.error("Failed to load states.");
    })();
  }, []);

  // unified change handler with cascading logic preserved
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // password validations (live)
      if (name === "password") {
        setPasswordStrength(passwordRegex.test(value));
        setPasswordMatch(value === prev.confirmPassword);
      }
      if (name === "confirmPassword") {
        setPasswordMatch(prev.password === value);
      }

      // cascade resets & fetches
      if (name === "state") {
        updated.division = "";
        updated.district = "";
        updated.taluka = "";
        updated.department = "";
        setDivisions([]);
        setDistricts([]);
        setTalukas([]);
        if (value) fetchDivisions(value);
      }

      if (name === "division") {
        updated.district = "";
        updated.taluka = "";
        updated.department = "";
        setDistricts([]);
        setTalukas([]);
        if (value) fetchDistricts(prev.state, value);
      }

      if (name === "district") {
        updated.taluka = "";
        updated.department = "";
        setTalukas([]);
        if (value) fetchTalukas(prev.state, prev.division, value);
      }

      if (name === "department") {
        // when department is entered, clear location fields
        updated.division = "";
        updated.district = "";
        updated.taluka = "";
        setDivisions([]);
        setDistricts([]);
        setTalukas([]);
      }

      return updated;
    });
  };

  // derived form validity (used to disable submit)
  const isFormValid = useMemo(() => {
    const { fname, email, password, confirmPassword } = formData;
    return !!fname && !!email && !!password && !!confirmPassword && passwordMatch && passwordStrength && !submitting;
  }, [formData, passwordMatch, passwordStrength, submitting]);

  // submit handler (keeps your logic)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fname || !formData.email || !formData.password || !formData.confirmPassword) {
      return toast.error("Please fill all required fields.");
    }

    if (!passwordStrength) {
      return toast.error("Password must include 1 uppercase, 1 digit, 1 special character and be at least 8 characters.");
    }

    if (!passwordMatch) {
      return toast.error("Passwords do not match.");
    }

    if (onboardMode === "department") {
      if (!formData.department.trim()) {
        return toast.error("Please enter Department name.");
      }
    } else {
      if (!formData.division || !formData.district || !formData.taluka) {
        return toast.error("Please select Division, District, and Taluka.");
      }
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...rest } = formData;
      const payload = { ...rest, password: SHA256(formData.password).toString() };
      const { data, error } = await submitSignup(payload);
      if (error) toast.error("Signup failed.");
      else toast.success("Signup request submitted! Awaiting admin approval.");
    } catch (err) {
      toast.error("Signup failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // small helper to render options
  const renderOptions = (list, keyField, labelField) =>
    list.map((i) => <option key={i[keyField]} value={i[keyField]}>{i[labelField]}</option>);

  return (
    <div className="container">
      <div className="header">
        <div className="logo-group">
          <Link to="/">
          <img src="/logo.png" alt="India Logo" className="logo" />
          </Link>
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

        {/* FORM: landscape-friendly layout */}
        <form className="form-grid form" onSubmit={handleSubmit}>

          {/* NAMES: first, middle, last in a single row group */}
          <div className="form-row name-row">
            <div className="form-field inline">
              <label htmlFor="fname">First name <span className="required">*</span></label>
              <input id="fname" name="fname" value={formData.fname} onChange={handleChange} required />
            </div>

            <div className="form-field inline">
              <label htmlFor="mname">Middle name</label>
              <input id="mname" name="mname" value={formData.mname} onChange={handleChange} />
            </div>

            <div className="form-field inline">
              <label htmlFor="lname">Last name</label>
              <input id="lname" name="lname" value={formData.lname} onChange={handleChange} />
            </div>
          </div>

          {/* Contact row: email & mobile */}
          <div className="form-row contact-row">
            <div className="form-field inline">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-field inline">
              <label htmlFor="mobile">Mobile</label>
              <input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
            </div>
          </div>

          {/* Password row: password & confirm (side-by-side) */}
          <div className="form-row password-row">
            <div className="form-field inline">
              <label htmlFor="password">Password <span className="required">*</span></label>
              <div className="password-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPassword((s) => !s)} aria-label="toggle password">
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-field inline">
              <label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></label>
              <div className="password-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirm((s) => !s)} aria-label="toggle confirm">
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          </div>

          {/* password helper (spans full width) */}
          {!passwordStrength && (
            <div className="form-field full">
              <p className="error-text">Password must be 8+ chars, include 1 uppercase, 1 number and 1 special character.</p>
            </div>
          )}
          {!passwordMatch && (
            <div className="form-field full">
              <p className="error-text">Passwords do not match.</p>
            </div>
          )}

          {/* State + Mode (state on left, mode radios on right) */}
          <div className="form-row">
            <div className="form-field inline">
              <label htmlFor="state">State</label>
              <select id="state" name="state" value={formData.state} onChange={handleChange}>
                <option value="">Select State</option>
                {renderOptions(states, "state_code", "state_name")}
              </select>
            </div>

            <div className="form-field inline">
              <label>Onboard as</label>
              <div className="radio-wrap">
                <label><input type="radio" name="onboardMode" value="location" checked={onboardMode === "location"} onChange={() => setOnboardMode("location")} /> Location</label>
                <label><input type="radio" name="onboardMode" value="department" checked={onboardMode === "department"} onChange={() => setOnboardMode("department")} /> Department</label>
              </div>
            </div>
          </div>

          {/* department (full) when selected */}
          {onboardMode === "department" && (
            <div className="form-field full">
              <label htmlFor="department">Department <span className="required">*</span></label>
              <input id="department" name="department" value={formData.department} onChange={handleChange} required />
            </div>
          )}

          {/* Location selects (division/district/taluka) — compact row */}
          {onboardMode === "location" && (
            <div className="form-row location-row">
              <div className="form-field inline">
                <label htmlFor="division">Division</label>
                <select id="division" name="division" value={formData.division} onChange={handleChange} disabled={!formData.state || loadingDivisions}>
                  <option value="">{loadingDivisions ? "Loading..." : "Select Division"}</option>
                  {renderOptions(divisions, "division_code", "division_name")}
                </select>
              </div>

              <div className="form-field inline">
                <label htmlFor="district">District</label>
                <select id="district" name="district" value={formData.district} onChange={handleChange} disabled={!formData.division || loadingDistricts}>
                  <option value="">{loadingDistricts ? "Loading..." : "Select District"}</option>
                  {renderOptions(districts, "district_code", "district_name")}
                </select>
              </div>

              <div className="form-field inline">
                <label htmlFor="taluka">Taluka</label>
                <select id="taluka" name="taluka" value={formData.taluka} onChange={handleChange} disabled={!formData.district || loadingTalukas}>
                  <option value="">{loadingTalukas ? "Loading..." : "Select Taluka"}</option>
                  {renderOptions(talukas, "taluka_code", "taluka_name")}
                </select>
              </div>
            </div>
          )}

          {/* submit */}
          <div className="form-field full" style={{ marginTop: 8 }}>
            <button type="submit" className="submit-btn" disabled={!isFormValid}>
              {submitting ? "Submitting..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>

      <div className="footer">
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </div>
    </div>
  );
}
