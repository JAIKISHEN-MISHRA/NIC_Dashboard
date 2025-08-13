// File: frontend/src/pages/Upload.jsx

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  fetchSchemes,
  fetchSchemeStructure,
  uploadSchemeData,
} from "../services/api";
import "../css/Login.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Upload() {
  const [formData, setFormData] = useState({
    scheme_code: "",
    state_code: "",
    division_code: "",
    district_code: "",
    taluka_code: "",
    year: "",
    month: "",
    data: {},
  });

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [schemeStructure, setSchemeStructure] = useState([]);
  const fulluser = JSON.parse(localStorage.getItem('full_user') || '{}');
const { user_code, user_level_code,role_code, division_code: user_division_code } = fulluser;


  useEffect(() => {
    const loadInitialData = async () => {
      const { data: stateData } = await getStates();
      const { data: schemeData } = await fetchSchemes();
      if (stateData) setStates(stateData);
      if (schemeData) setSchemes(schemeData);
    };
    loadInitialData();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "state_code") {
      const { data } = await getDivisions(value);
      setDivisions(data);
      setDistricts([]);
      setTalukas([]);
      setFormData((prev) => ({ ...prev, division_code: "", district_code: "", taluka_code: "" }));
    }

    if (name === "division_code") {
      const { data } = await getDistricts(formData.state_code, value);
      setDistricts(data);
      setTalukas([]);
      setFormData((prev) => ({ ...prev, district_code: "", taluka_code: "" }));
    }

    if (name === "district_code") {
      const { data } = await getTalukas(formData.state_code, formData.division_code, value);
      setTalukas(data);
      setFormData((prev) => ({ ...prev, taluka_code: "" }));
    }

    if (name === "scheme_code") {
      const res = await fetchSchemeStructure(value);
      if (res.data) setSchemeStructure(res.data);
    }
  };

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k] || typeof current[k] !== "object") {
      current[k] = {};
    }
    current = current[k];
  }

  current[keys[keys.length - 1]] = Number(value);
}
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}


const handleInputChange = (key, value) => {
  setFormData((prev) => {
    const newData = { ...prev.data };
    setNestedValue(newData, key, value);
    return { ...prev, data: newData };
  });
};


  const renderCategoryInputs = (categories, parentKey = "") => {
  return categories.map((cat) => {
    const key = parentKey ? `${parentKey}.${cat.category_name}` : cat.category_name;
    const isLeaf = !cat.children || cat.children.length === 0;

    return (
      <div key={key} style={{ marginLeft: "20px", marginTop: "10px" }}>
        <label style={{ fontWeight: isLeaf ? "normal" : "bold" }}>
          {cat.category_name}
        </label>

        {isLeaf ? (
          <input
            type="number"
value={getNestedValue(formData.data, key) ?? ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
          />
        ) : (
          <div style={{ marginLeft: "10px" }}>
            {renderCategoryInputs(cat.children, key)}
          </div>
        )}
      </div>
    );
  });
};


  const handleSubmit = async (e) => {
    e.preventDefault();

     const payload = {
    ...formData,
    data: formData.data,
    user_code,
    role_code,
    user_level_code,
   user_division_code
  };

    const { data, error } = await uploadSchemeData(payload);
    if (error) toast.error("Upload failed");
    else toast.success("Data uploaded successfully");
  };

  return (
    <div className="container">
      <h2>Upload Scheme Data</h2>
      <form onSubmit={handleSubmit}>
        <label>Scheme</label>
        <select name="scheme_code" value={formData.scheme_code} onChange={handleChange} required>
          <option value="">Select Scheme</option>
          {schemes.map((s) => (
            <option key={s.scheme_code} value={s.scheme_code}>{s.scheme_name}</option>
          ))}
        </select>

        <label>Year</label>
        <select name="year" value={formData.year} onChange={handleChange} required>
          <option value="">Select Year</option>
          {Array.from({ length: 10 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>

        <label>Month</label>
        <select name="month" value={formData.month} onChange={handleChange} required>
          <option value="">Select Month</option>
          {months.map((m, idx) => (
            <option key={idx + 1} value={String(idx + 1).padStart(2, '0')}>{m}</option>
          ))}
        </select>

        <label>State</label>
        <select name="state_code" value={formData.state_code} onChange={handleChange} required>
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.state_code} value={s.state_code}>{s.state_name}</option>
          ))}
        </select>

        <label>Division</label>
        <select name="division_code" value={formData.division_code} onChange={handleChange} disabled={!formData.state_code}>
          <option value="">Select Division</option>
          {divisions.map((d) => (
            <option key={d.division_code} value={d.division_code}>{d.division_name}</option>
          ))}
        </select>

        <label>District</label>
        <select name="district_code" value={formData.district_code} onChange={handleChange} disabled={!formData.division_code}>
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.district_code} value={d.district_code}>{d.district_name}</option>
          ))}
        </select>

        <label>Taluka</label>
        <select name="taluka_code" value={formData.taluka_code} onChange={handleChange} disabled={!formData.district_code}>
          <option value="">Select Taluka</option>
          {talukas.map((t) => (
            <option key={t.taluka_code} value={t.taluka_code}>{t.taluka_name}</option>
          ))}
        </select>

        {renderCategoryInputs(schemeStructure)}

        <button type="submit" className="submit-btn">Upload</button>
      </form>
    </div>
  );
}