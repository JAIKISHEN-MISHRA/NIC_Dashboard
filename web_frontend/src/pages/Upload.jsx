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

  const [schemeFrequency, setSchemeFrequency] = useState(null);
  const [dailyMonth, setDailyMonth] = useState("");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [weeklyStartDate, setWeeklyStartDate] = useState("");
  const [weeklyEndDate, setWeeklyEndDate] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [periods, setPeriods] = useState([]);

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [schemeStructure, setSchemeStructure] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [{ data: stateData }, { data: schemeData }] = await Promise.all([
          getStates(),
          fetchSchemes(),
        ]);
        if (stateData) setStates(stateData);
        if (schemeData) setSchemes(schemeData);

        if (lsState) {
          try {
            const { data: divisionData } = await getDivisions(lsState);
            setDivisions(divisionData || []);
          } catch (e) {
            console.warn("Failed to load divisions for lsState", e);
          }

          if (lsDivision) {
            try {
              const { data: districtData } = await getDistricts(lsState, lsDivision);
              setDistricts(districtData || []);
            } catch (e) {
              console.warn("Failed to load districts for lsDivision", e);
            }

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
    
    // UPDATED LOGIC: Keep empty string as is, otherwise convert to number
    if (value === "") {
        current[keys[keys.length - 1]] = "";
    } else {
        const num = Number(value);
        current[keys[keys.length - 1]] = isNaN(num) ? value : num;
    }
  }

  function getNestedValue(obj, path) {
    return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }

  const handleInputChange = (key, value) => {
    // Only allow non-negative numbers or an empty string to clear the field
    if (value === "" || Number(value) >= 0) {
        setFormData((prev) => {
            const newData = { ...prev.data };
            setNestedValue(newData, key, value);
            return { ...prev, data: newData };
        });
    }
  };

  const pad = (n) => String(n).padStart(2, "0");

  const dateToYYYYMMDD = (d) => {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  };

  function datesBetween(startISO, endISO) {
    const list = [];
    const cur = new Date(startISO);
    const end = new Date(endISO);
    if (isNaN(cur) || isNaN(end) || cur > end) return list;
    while (cur <= end) {
      list.push(dateToYYYYMMDD(new Date(cur)));
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  }

  function mondayOf(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = ((day + 6) % 7);
    d.setDate(d.getDate() - diff);
    return dateToYYYYMMDD(d);
  }

  function weeksBetween(startISO, endISO) {
    const weeks = [];
    const startMon = mondayOf(startISO);
    const endMon = mondayOf(endISO);
    if (!startMon || !endMon) return weeks;
    let cur = new Date(startMon);
    const last = new Date(endMon);
    while (cur <= last) {
      weeks.push(dateToYYYYMMDD(cur));
      cur.setDate(cur.getDate() + 7);
    }
    return weeks;
  }

  function yearsBetween(startYear, endYear) {
    const ys = [];
    const s = Number(startYear);
    const e = Number(endYear);
    if (!s || !e || s > e) return ys;
    for (let y = s; y <= e; y++) ys.push(String(y));
    return ys;
  }

  useEffect(() => {
    if (schemeFrequency === "Daily") {
      if (!dailyMonth) {
        setPeriods([]);
        return;
      }
      if (!dailyStartDate || !dailyEndDate) {
        const nowYear = formData.year || new Date().getFullYear();
        const start = `${nowYear}-${dailyMonth}-01`;
        const endDate = new Date(nowYear, Number(dailyMonth), 0).getDate();
        const end = `${nowYear}-${dailyMonth}-${pad(endDate)}`;
        setDailyStartDate(start);
        setDailyEndDate(end);
        setPeriods(datesBetween(start, end));
      } else {
        const year = formData.year || new Date().getFullYear();
        const monthStart = `${year}-${dailyMonth}-01`;
        const lastDay = new Date(year, Number(dailyMonth), 0).getDate();
        const monthEnd = `${year}-${dailyMonth}-${pad(lastDay)}`;
        const start = dateToYYYYMMDD(dailyStartDate) || monthStart;
        const end = dateToYYYYMMDD(dailyEndDate) || monthEnd;
        const sDate = new Date(start) < new Date(monthStart) ? monthStart : start;
        const eDate = new Date(end) > new Date(monthEnd) ? monthEnd : end;
        setPeriods(datesBetween(sDate, eDate));
      }
    } else if (schemeFrequency === "Weekly") {
      if (!weeklyStartDate || !weeklyEndDate) {
        setPeriods([]);
        return;
      }
      const s = dateToYYYYMMDD(weeklyStartDate);
      const e = dateToYYYYMMDD(weeklyEndDate);
      setPeriods(weeksBetween(s, e).map(m => `week_${m}`));
    } else if (schemeFrequency === "Monthly") {
      if (!formData.month || !formData.year) {
        setPeriods([]);
      } else {
        setPeriods([`${formData.year}-${formData.month}`]);
      }
    } else if (schemeFrequency === "Yearly") {
      if (!yearStart || !yearEnd) {
        setPeriods([]);
      } else {
        setPeriods(yearsBetween(yearStart, yearEnd));
      }
    } else {
      setPeriods([]);
    }
  }, [schemeFrequency, dailyMonth, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, formData.month, formData.year, yearStart, yearEnd]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    try {
      if (name === "state_code") {
        const { data } = await getDivisions(value);
        setDivisions(data || []);
        setDistricts([]);
        setTalukas([]);
        setFormData((prev) => ({ ...prev, division_code: "", district_code: "", taluka_code: "" }));
      }

      if (name === "division_code") {
        const { data } = await getDistricts(formData.state_code, value);
        setDistricts(data || []);
        setTalukas([]);
        setFormData((prev) => ({ ...prev, district_code: "", taluka_code: "" }));
      }

      if (name === "district_code") {
        const { data } = await getTalukas(formData.state_code, formData.division_code, value);
        setTalukas(data || []);
        setFormData((prev) => ({ ...prev, taluka_code: "" }));
      }

      if (name === "scheme_code") {
        const res = await fetchSchemeStructure(value);
        const payload = res?.data ?? res;
        if (payload?.data) setSchemeStructure(payload.data);
        setSchemeFrequency(payload?.frequency ?? null);
        console.log(payload.frequency)

        // reset period controls
        setDailyMonth("");
        setDailyStartDate("");
        setDailyEndDate("");
        setWeeklyStartDate("");
        setWeeklyEndDate("");
        setYearStart("");
        setYearEnd("");
        setPeriods([]);
      }
    } catch (err) {
      console.error("Error in handleChange dependent fetch:", err);
      toast.error("Failed to fetch location data");
    }
  };

  const renderCategoryInputs = (categories, periodKey = "", parentDataPath = "", parentReactKey = "") => {
    return categories.map((cat, index) => {
      const safeKey = `${cat.category_name}_${cat.category_id || index}`;
      const dataPath = parentDataPath ? `${parentDataPath}.${safeKey}` : safeKey;
      const fullPath = periodKey ? `${periodKey}.${dataPath}` : dataPath;
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
              min="0" // CHANGE: Prevents negative numbers
              step="any"
              value={getNestedValue(formData.data, fullPath) ?? ""}
              onChange={(e) => handleInputChange(fullPath, e.target.value)}
              onWheel={(e) => e.target.blur()} // CHANGE: Disables mouse wheel scroll
            />
          ) : (
            <div style={{ marginLeft: "10px" }}>
              {renderCategoryInputs(cat.children, periodKey, dataPath, reactKey)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.scheme_code || !formData.state_code || !schemeFrequency) {
      toast.error("Please select a scheme and state.");
      return;
    }

    if (["Daily", "Weekly", "Monthly", "Yearly"].includes(schemeFrequency) && periods.length === 0) {
      toast.error("Please select valid period(s) for the chosen frequency.");
      return;
    }

    const payload = { ...formData, frequency: schemeFrequency, periods, user_division_code };

    try {
      const { error } = await uploadSchemeData(payload);
      if (error) {
        toast.error("Upload failed: " + (error.message || ""));
      } else {
        toast.success("Data uploaded successfully");
      }
    } catch (err) {
      console.error("upload error", err);
      toast.error("An unexpected error occurred during upload.");
    }
  };

  const PeriodControls = () => {
    if (!schemeFrequency) return null;
    const yearOptions = [String(new Date().getFullYear()), String(new Date().getFullYear() - 1)];

    if (schemeFrequency === "Daily") {
      return (
        <div style={{ margin: "12px 0" }}>
          <label>Year</label>
          <select name="year" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}>
            <option value="">{new Date().getFullYear()}</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label style={{ marginLeft: 12 }}>Month</label>
          <select value={dailyMonth} onChange={(e) => setDailyMonth(e.target.value)}>
            <option value="">Select Month</option>
            {months.map((m, idx) => (<option key={idx} value={String(idx + 1).padStart(2, "0")}>{m}</option>))}
          </select>
          <label style={{ marginLeft: 12 }}>Start Date</label>
          <input type="date" value={dailyStartDate} onChange={(e) => setDailyStartDate(e.target.value)} />
          <label style={{ marginLeft: 12 }}>End Date</label>
          <input type="date" value={dailyEndDate} onChange={(e) => setDailyEndDate(e.target.value)} />
          <div style={{ marginTop: 8 }}><strong>Dates selected:</strong> {periods.length} {periods.length === 1 ? "day" : "days"}</div>
        </div>
      );
    }
    if (schemeFrequency === "Weekly") {
      return (
        <div style={{ margin: "12px 0" }}>
          <label>Start Date</label>
          <input type="date" value={weeklyStartDate} onChange={(e) => setWeeklyStartDate(e.target.value)} />
          <label style={{ marginLeft: 12 }}>End Date</label>
          <input type="date" value={weeklyEndDate} onChange={(e) => setWeeklyEndDate(e.target.value)} />
          <div style={{ marginTop: 8 }}><strong>Weeks:</strong> {periods.length} {periods.length === 1 ? "week" : "weeks"}</div>
        </div>
      );
    }
    if (schemeFrequency === "Monthly") {
      return (
        <div style={{ margin: "12px 0" }}>
          <label>Year</label>
          <select name="year" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}>
            <option value="">Select Year</option>
            {Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
          </select>
          <label style={{ marginLeft: 12 }}>Month</label>
          <select name="month" value={formData.month} onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}>
            <option value="">Select Month</option>
            {months.map((m, idx) => (<option key={idx} value={String(idx + 1).padStart(2, "0")}>{m}</option>))}
          </select>
          <div style={{ marginTop: 8 }}><strong>Month:</strong> {formData.year && formData.month ? `${formData.year}-${formData.month}` : 'Not selected'}</div>
        </div>
      );
    }
    if (schemeFrequency === "Yearly") {
      const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
      return (
        <div style={{ margin: "12px 0" }}>
          <label>Start Year</label>
          <select value={yearStart} onChange={(e) => setYearStart(e.target.value)}>
            <option value="">Start Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label style={{ marginLeft: 12 }}>End Year</label>
          <select value={yearEnd} onChange={(e) => setYearEnd(e.target.value)}>
            <option value="">End Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div style={{ marginTop: 8 }}><strong>Years:</strong> {periods.length} {periods.length === 1 ? "year" : "years"}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container">
      <h2>Upload Scheme Data</h2>
      <form onSubmit={handleSubmit}>
        <label>Scheme</label>
        <select name="scheme_code" value={formData.scheme_code} onChange={handleChange} required>
          <option value="">Select Scheme</option>
          {schemes.map((s) => (<option key={s.scheme_code} value={s.scheme_code}>{s.scheme_name}</option>))}
        </select>

        <div style={{ marginTop: 12 }}>
          <strong>Scheme Frequency:</strong> {schemeFrequency ?? "—"}
        </div>
        <PeriodControls />

        <label>State</label>
        <select name="state_code" value={formData.state_code} onChange={handleChange} required disabled={fixedState}>
          <option value="">Select State</option>
          {states.map((s) => (<option key={s.state_code} value={s.state_code}>{s.state_name}</option>))}
        </select>

        <label>Division</label>
        <select name="division_code" value={formData.division_code} onChange={handleChange} disabled={fixedDivision || !formData.state_code}>
          <option value="">Select Division</option>
          {divisions.map((d) => (<option key={d.division_code} value={d.division_code}>{d.division_name}</option>))}
        </select>

        <label>District</label>
        <select name="district_code" value={formData.district_code} onChange={handleChange} disabled={fixedDistrict || !formData.division_code}>
          <option value="">Select District</option>
          {districts.map((d) => (<option key={d.district_code} value={d.district_code}>{d.district_name}</option>))}
        </select>

        <label>Taluka</label>
        <select name="taluka_code" value={formData.taluka_code} onChange={handleChange} disabled={fixedTaluka || !formData.district_code}>
          <option value="">Select Taluka</option>
          {talukas.map((t) => (<option key={t.taluka_code} value={t.taluka_code}>{t.taluka_name}</option>))}
        </select>

        {periods && periods.length > 0 ? (
          periods.map((p) => (
            <div key={p} style={{ border: "1px solid #eee", padding: 8, marginTop: 12 }}>
              <h4 style={{ margin: "6px 0" }}>
                {schemeFrequency === "Daily" && `Date: ${p}`}
                {schemeFrequency === "Weekly" && `Week of: ${p.replace(/^week_/, "")}`}
                {schemeFrequency === "Monthly" && `Month: ${p}`}
                {schemeFrequency === "Yearly" && `Year: ${p}`}
              </h4>
              {renderCategoryInputs(schemeStructure, p)}
            </div>
          ))
        ) : (
          <div style={{ marginTop: 12 }}>
            {renderCategoryInputs(schemeStructure)}
          </div>
        )}

        <button type="submit" className="submit-btn" style={{ marginTop: 16 }}>Upload</button>
      </form>
    </div>
  );
}