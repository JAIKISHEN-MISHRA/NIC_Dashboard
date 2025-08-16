// frontend/src/pages/Upload.jsx
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
  // read user info (for user_division_code) and localStorage fixed location values
  const fulluser = JSON.parse(localStorage.getItem('full_user') || '{}');
  const user_division_code = fulluser.division_code || fulluser.user_division_code || null;

  const lsState = localStorage.getItem("state_code") || "";
  const lsDivision = localStorage.getItem("division_code") || "";
  const lsDistrict = localStorage.getItem("district_code") || "";
  const lsTaluka = localStorage.getItem("taluka_code") || "";

  const fixedState = !!lsState;
  const fixedDivision = !!lsDivision;
  const fixedDistrict = !!lsDistrict;
  const fixedTaluka = !!lsTaluka;

  const [formData, setFormData] = useState({
    scheme_code: "",
    state_code: lsState,
    division_code: lsDivision,
    district_code: lsDistrict,
    taluka_code: lsTaluka,
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

  useEffect(() => {
    // load states and schemes, then if localStorage has values load dependent lists
    const loadInitialData = async () => {
      try {
        const [{ data: stateData }, { data: schemeData }] = await Promise.all([
          getStates(),
          fetchSchemes(),
        ]);
        if (stateData) setStates(stateData);
        if (schemeData) setSchemes(schemeData);

        // If LS state exists, fetch divisions for it
        if (lsState) {
          try {
            const { data: divisionData } = await getDivisions(lsState);
            setDivisions(divisionData || []);
          } catch (e) {
            console.warn("Failed to load divisions for lsState", e);
          }

          // If LS division exists, fetch districts
          if (lsDivision) {
            try {
              const { data: districtData } = await getDistricts(lsState, lsDivision);
              setDistricts(districtData || []);
            } catch (e) {
              console.warn("Failed to load districts for lsDivision", e);
            }

            // If LS district exists, fetch talukas
            if (lsDistrict) {
              try {
                const { data: talukaData } = await getTalukas(lsState, lsDivision, lsDistrict);
                setTalukas(talukaData || []);
              } catch (e) {
                console.warn("Failed to load talukas for lsDistrict", e);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
        toast.error("Failed to load initial data");
      }
    };
    loadInitialData();
  }, [lsState, lsDivision, lsDistrict, lsTaluka]);

  // unified change handler that maintains hierarchy correctly
  const handleChange = async (e) => {
    const { name, value } = e.target;

    // update formData synchronously based on name/value
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Decide current state/division/district values for fetching children
    const nextState = name === "state_code" ? value : formData.state_code;
    const nextDivision = name === "division_code" ? value : formData.division_code;
    const nextDistrict = name === "district_code" ? value : formData.district_code;

    try {
      if (name === "state_code") {
        // load divisions for selected state
        const { data } = await getDivisions(value);
        setDivisions(data || []);
        setDistricts([]);
        setTalukas([]);
        setFormData((prev) => ({ ...prev, division_code: "", district_code: "", taluka_code: "" }));
      }

      if (name === "division_code") {
        // use the latest state (nextState) to fetch districts
        const { data } = await getDistricts(nextState, value);
        setDistricts(data || []);
        setTalukas([]);
        setFormData((prev) => ({ ...prev, district_code: "", taluka_code: "" }));
      }

      if (name === "district_code") {
        // use the latest state & division to fetch talukas
        const { data } = await getTalukas(nextState, nextDivision, value);
        setTalukas(data || []);
        setFormData((prev) => ({ ...prev, taluka_code: "" }));
      }

      if (name === "scheme_code") {
        const res = await fetchSchemeStructure(value);
        if (res?.data?.data) setSchemeStructure(res.data.data);
      }
    } catch (err) {
      console.error("Error in handleChange dependent fetch:", err);
      toast.error("Failed to fetch location data");
    }
  };

  // helpers for nested data
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

  const renderCategoryInputs = (categories, parentDataPath = "", parentReactKey = "") => {
    return categories.map((cat, index) => {
      const safeKey = `${cat.category_name}_${cat.category_id || index}`;
      const dataPath = parentDataPath ? `${parentDataPath}.${safeKey}` : safeKey;
      const reactKey = parentReactKey ? `${parentReactKey}-${index}` : `${index}`;
      const isLeaf = !cat.children || cat.children.length === 0;

      return (
        <div key={reactKey} style={{ marginLeft: "20px", marginTop: "10px" }}>
          <label style={{ fontWeight: isLeaf ? "normal" : "bold" }}>
            {cat.category_name}
          </label>

          {isLeaf ? (
            <input
              type="number"
              value={getNestedValue(formData.data, dataPath) ?? ""}
              onChange={(e) => handleInputChange(dataPath, e.target.value)}
            />
          ) : (
            <div style={{ marginLeft: "10px" }}>
              {renderCategoryInputs(cat.children, dataPath, reactKey)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ensure required fields
    if (!formData.scheme_code) {
      toast.error("Please select a scheme");
      return;
    }
    if (!formData.state_code) {
      toast.error("Please select a state");
      return;
    }

    const payload = {
      ...formData,
      data: formData.data,
      user_division_code
    };

    try {
      const { data, error } = await uploadSchemeData(payload);
      if (error) {
        toast.error("Upload failed");
      } else {
        toast.success("Data uploaded successfully");
        // optionally clear form or keep values as required
      }
    } catch (err) {
      console.error("upload error", err);
      toast.error("Upload failed");
    }
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
        <select
          name="state_code"
          value={formData.state_code}
          onChange={handleChange}
          required
          disabled={fixedState}
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.state_code} value={s.state_code}>{s.state_name}</option>
          ))}
        </select>

        <label>Division</label>
        <select
          name="division_code"
          value={formData.division_code}
          onChange={handleChange}
          disabled={fixedDivision || !formData.state_code}
        >
          <option value="">Select Division</option>
          {divisions.map((d) => (
            <option key={d.division_code} value={d.division_code}>{d.division_name}</option>
          ))}
        </select>

        <label>District</label>
        <select
          name="district_code"
          value={formData.district_code}
          onChange={handleChange}
          disabled={fixedDistrict || !formData.division_code}
        >
          <option value="">Select District</option>
          {districts.map((d) => (
            <option key={d.district_code} value={d.district_code}>{d.district_name}</option>
          ))}
        </select>

        <label>Taluka</label>
        <select
          name="taluka_code"
          value={formData.taluka_code}
          onChange={handleChange}
          disabled={fixedTaluka || !formData.district_code}
        >
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
