import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import "../css/signup.css";
import { Link } from "react-router-dom";
import SHA256 from "crypto-js/sha256";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getDepartments,
  getMinistry,
  submitSignup,
} from "../services/api";

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
    ministry: "",
  });

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [ministry, setMinistry] = useState([]);

  const [onboardMode, setOnboardMode] = useState("location");
  const [stateOption, setStateOption] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [loadingDepartment, setLoadingDepartments] = useState(false);
  const [loadingMinistry, setLoadingMinistry] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Fetch helpers
  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDivisions(true);
    const { data } = await getDivisions(stateCode);
    setLoadingDivisions(false);
    data ? setDivisions(data) : toast.error("Failed to load divisions.");
  }, []);

  const fetchDepartment = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDepartments(true);
    const { data } = await getDepartments(stateCode);
    setLoadingDepartments(false);
    data ? setDepartments(data) : toast.error("Failed to load departments.");
  }, []);

  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return;
    setLoadingDistricts(true);
    const { data } = await getDistricts(stateCode, divisionCode);
    setLoadingDistricts(false);
    data ? setDistricts(data) : toast.error("Failed to load districts.");
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return;
    setLoadingTalukas(true);
    const { data } = await getTalukas(stateCode, divisionCode, districtCode);
    setLoadingTalukas(false);
    data ? setTalukas(data) : toast.error("Failed to load talukas.");
  }, []);

  const fetchMinistry = useCallback(async () => {
    setLoadingMinistry(true);
    const { data } = await getMinistry();
    setLoadingMinistry(false);
    data ? setMinistry(data) : toast.error("Failed to load ministry.");
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingStates(true);
      const { data } = await getStates();
      setLoadingStates(false);
      data ? setStates(data) : toast.error("Failed to load states.");
    })();
  }, []);

  useEffect(() => {
    if (onboardMode === "ministry") fetchMinistry();
  }, [onboardMode, fetchMinistry]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "password") {
        setPasswordStrength(passwordRegex.test(value));
        setPasswordMatch(value === prev.confirmPassword);
      }
      if (name === "confirmPassword") {
        setPasswordMatch(prev.password === value);
      }

      // Reset dependent selects
      if (name === "state") {
        updated.division = updated.district = updated.taluka = updated.department = "";
        setDivisions([]);
        setDistricts([]);
        setTalukas([]);
        setDepartments([]);
        if (value) {
          if (onboardMode === "location") {
            fetchDivisions(value);
            fetchDepartment(value);
          } else fetchMinistry();
        }
      }

      if (name === "division") {
        updated.district = updated.taluka = "";
        setDistricts([]);
        setTalukas([]);
        if (value) fetchDistricts(prev.state, value);
      }

      if (name === "district") {
        updated.taluka = "";
        setTalukas([]);
        if (value) fetchTalukas(prev.state, prev.division, value);
      }

      if (name === "ministry") {
        updated.division = updated.district = updated.taluka = updated.department = "";
        setDivisions([]);
        setDistricts([]);
        setTalukas([]);
        setDepartments([]);
      }

      return updated;
    });
  };

  const isFormValid = useMemo(() => {
    const { fname, email, password, confirmPassword } = formData;
    return !!fname && !!email && !!password && !!confirmPassword && passwordMatch && passwordStrength && !submitting;
  }, [formData, passwordMatch, passwordStrength, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return toast.error("Please fill all required fields correctly.");

    if (onboardMode === "department" && !formData.department.trim()) {
      return toast.error("Please enter Department name.");
    }
    if (onboardMode === "location" && (!formData.division || !formData.district || !formData.taluka)) {
      return toast.error("Please select Division, District, and Taluka.");
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...rest } = formData;
      const payload = { ...rest, password: SHA256(formData.password).toString() };
      const { data, error } = await submitSignup(payload);
      if (error) toast.error(error.response?.data?.error || "Signup failed.");
      else toast.success("Signup request submitted! Awaiting admin approval.");
    } catch {
      toast.error("Signup failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (list, keyField, labelField) =>
    list.map((i) => <option key={i[keyField]} value={i[keyField]}>{i[labelField]}</option>);

  return (
    <div className="container">
      <header className="header">
        <div className="logo-group">
          <Link to="/"><img src="/logo.png" alt="India Logo" className="logo" /></Link>
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
      </header>

      <main className="login-box">
        <h2 className="login-title">Sign Up</h2>
        <form className="form-grid form" onSubmit={handleSubmit}>

          {/* Name Row */}
          <div className="form-row name-row">
            {["fname", "mname", "lname"].map((n) => (
              <div className="form-field inline" key={n}>
                <label htmlFor={n}>
                  {n === "fname" ? "First name" : n === "mname" ? "Middle name" : "Last name"} {n === "fname" && <span className="required">*</span>}
                </label>
                <input id={n} name={n} value={formData[n]} onChange={handleChange} required={n === "fname"} />
              </div>
            ))}
          </div>

          {/* Contact Row */}
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

          {/* Password Row */}
          <div className="form-row password-row">
            {["password", "confirmPassword"].map((p) => (
              <div className="form-field inline" key={p}>
                <label htmlFor={p}>{p === "password" ? "Password" : "Confirm Password"} <span className="required">*</span></label>
                <div className="password-wrap">
                  <input
                    id={p}
                    type={p === "password" ? (showPassword ? "text" : "password") : showConfirm ? "text" : "password"}
                    name={p}
                    value={formData[p]}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => p === "password" ? setShowPassword(s => !s) : setShowConfirm(s => !s)}>
                    {p === "password" ? (showPassword ? "🙈" : "👁️") : showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Password Helper */}
          {!passwordStrength && <p className="error-text full">Password must be 8+ chars, include 1 uppercase, 1 number and 1 special character.</p>}
          {!passwordMatch && <p className="error-text full">Passwords do not match.</p>}

          {/* Onboard Mode */}
          <div className="form-row">
            <div className="form-field inline">
              <label>Onboard as</label>
              <div className="radio-wrap">
                {["location", "ministry"].map((mode) => (
                  <label key={mode}>
                    <input type="radio" name="onboardMode" value={mode} checked={onboardMode === mode} onChange={() => { setOnboardMode(mode); setStateOption(""); }} />{" "}
                    {mode === "location" ? "State" : "Central"}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Location / Division / Department */}
          {onboardMode === "location" && (
            <>
              <div className="form-row">
                <div className="form-field inline">
                  <label htmlFor="state">State</label>
                  <select id="state" name="state" value={formData.state} onChange={handleChange}>
                    <option value="">{loadingStates ? "Loading..." : "Select State"}</option>
                    {renderOptions(states, "state_code", "state_name")}
                  </select>
                </div>
                <div className="form-field inline">
                  <label>Choose Type</label>
                  <div className="radio-wrap">
                    {["division", "department"].map((opt) => (
                      <label key={opt}>
                        <input type="radio" name="stateOption" value={opt} checked={stateOption === opt} onChange={() => setStateOption(opt)} /> {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {stateOption === "division" && (
                <div className="form-row location-row">
                  {[
                    { key: "division", list: divisions, loading: loadingDivisions },
                    { key: "district", list: districts, loading: loadingDistricts },
                    { key: "taluka", list: talukas, loading: loadingTalukas },
                  ].map(({ key, list, loading }) => (
                    <div className="form-field inline" key={key}>
                      <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <select
                        id={key}
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        disabled={!formData[key === "division" ? "state" : key === "district" ? "division" : "district"] || loading}
                      >
                        <option value="">{loading ? "Loading..." : `Select ${key.charAt(0).toUpperCase() + key.slice(1)}`}</option>
                        {renderOptions(list, `${key}_code`, `${key}_name`)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {stateOption === "department" && (
                <div className="form-field full">
                  <label htmlFor="department">Department <span className="required">*</span></label>
                  <select id="department" name="department" value={formData.department} onChange={handleChange} disabled={!formData.state || loadingDepartment}>
                    <option value="">{loadingDepartment ? "Loading..." : "Select Department"}</option>
                    {renderOptions(departments, "dept_code", "dept_name")}
                  </select>
                </div>
              )}
            </>
          )}

          {onboardMode === "ministry" && (
            <div className="form-field full">
              <label htmlFor="ministry">Ministry <span className="required">*</span></label>
              <select id="ministry" name="ministry" value={formData.ministry} onChange={handleChange}>
                <option value="">{loadingMinistry ? "Loading..." : "Select Ministry"}</option>
                {renderOptions(ministry, "ministry_code", "ministry_name")}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-field full">
            <button type="submit" className="submit-btn" disabled={!isFormValid}>{submitting ? "Submitting..." : "Sign Up"}</button>
          </div>
        </form>
      </main>

      <footer className="footer">
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </footer>
    </div>
  );
}
