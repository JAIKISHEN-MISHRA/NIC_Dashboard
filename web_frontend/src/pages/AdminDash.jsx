import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  fetchSchemes,
  fetchSchemeStructure,
  getDashboardData,
  getTimeSeriesData,
} from "../services/api";
import Charts from "../Components/Charts";
import { Box, Typography, Grid, Skeleton } from "@mui/material";
import WelcomeBanner from "../Components/WelcomeBanner";
import FilterPanel from "../Components/FilterPanel";
import EmptyState from "../Components/EmptyState";
import PeriodControls from "../Components/PeriodControls"; // Assuming you move PeriodControls to a separate file

// --- Helper Functions for Date Calculations ---
const pad = (n) => String(n).padStart(2, "0");
const dateToYYYYMMDD = (d) => {
  const dt = new Date(d);
  return !Number.isNaN(dt.getTime())
    ? `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
    : null;
};
const datesBetween = (startISO, endISO) => {
  const list = [];
  const cur = new Date(startISO);
  const end = new Date(endISO);
  if (isNaN(cur) || isNaN(end) || cur > end) return list;
  while (cur <= end) {
    list.push(dateToYYYYMMDD(new Date(cur)));
    cur.setDate(cur.getDate() + 1);
  }
  return list;
};
const mondayOf = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // 0 if Monday
  d.setDate(d.getDate() - diff);
  return dateToYYYYMMDD(d);
};
const weeksBetween = (startISO, endISO) => {
  const weeks = [];
  const startMon = mondayOf(startISO);
  const endMon = mondayOf(endISO);
  if (!startMon || !endMon) return weeks;
  let cur = new Date(startMon);
  const last = new Date(endMon);
  while (cur <= last) {
    weeks.push(`week_${dateToYYYYMMDD(cur)}`);
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
};
const yearsBetween = (startYear, endYear) => {
  const ys = [];
  const s = Number(startYear);
  const e = Number(endYear);
  if (!s || !e || s > e) return ys;
  for (let y = s; y <= e; y++) ys.push(String(y));
  return ys;
};

// --- Main Component ---
export default function AdminDashboard() {
  // Dropdown options
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [schemes, setSchemes] = useState([]);

  // Consolidated filter state
  const [filters, setFilters] = useState({
    scheme: "",
    state: "",
    division: "",
    district: "",
    taluka: "",
    year: "",
    month: "",
  });

  // Period selection state
  const [periodInputs, setPeriodInputs] = useState({
    dailyMonth: "",
    dailyStartDate: "",
    dailyEndDate: "",
    weeklyStartDate: "",
    weeklyEndDate: "",
    yearStart: "",
    yearEnd: "",
  });

  // UI and data state
  const [dashboardData, setDashboardData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTimeSeries, setIsTimeSeries] = useState(false);
  const [schemeFrequency, setSchemeFrequency] = useState(null);

  const years = useMemo(() => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i), []);
  const months = useMemo(() => ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"], []);

  // Initial data load from API and localStorage
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const [schemeRes, stateRes] = await Promise.all([fetchSchemes(), getStates()]);
        setSchemes(schemeRes?.data || []);
        setStates(stateRes?.data || []);

        const lsState = localStorage.getItem("state_code") || "";
        const lsDivision = localStorage.getItem("division_code") || "";
        const lsDistrict = localStorage.getItem("district_code") || "";
        const lsTaluka = localStorage.getItem("taluka_code") || "";

        setFilters(f => ({ ...f, state: lsState, division: lsDivision, district: lsDistrict, taluka: lsTaluka }));

        if (lsState) {
          const divisionRes = await getDivisions(lsState);
          setDivisions(divisionRes.data || []);
          if (lsDivision) {
            const districtRes = await getDistricts(lsState, lsDivision);
            setDistricts(districtRes.data || []);
            if (lsDistrict) {
              const talukaRes = await getTalukas(lsState, lsDivision, lsDistrict);
              setTalukas(talukaRes.data || []);
            }
          }
        }
      } catch {
        setError("Failed to load initial data.");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Cascading location fetches
  useEffect(() => {
    if (!filters.state) return;
    const isFixed = !!localStorage.getItem("division_code");
    if (!isFixed) setFilters(f => ({ ...f, division: "", district: "", taluka: "" }));
    setDistricts([]);
    setTalukas([]);
    getDivisions(filters.state).then((res) => setDivisions(res.data || []));
  }, [filters.state]);

  useEffect(() => {
    if (!filters.division) return;
    const isFixed = !!localStorage.getItem("district_code");
    if (!isFixed) setFilters(f => ({ ...f, district: "", taluka: "" }));
    setTalukas([]);
    getDistricts(filters.state, filters.division).then((res) => setDistricts(res.data || []));
  }, [filters.state, filters.division]);

  useEffect(() => {
    if (!filters.district) return;
    const isFixed = !!localStorage.getItem("taluka_code");
    if (!isFixed) setFilters(f => ({ ...f, taluka: "" }));
    getTalukas(filters.state, filters.division, filters.district).then((res) => setTalukas(res.data || []));
  }, [filters.state, filters.division, filters.district]);

  // Fetch scheme frequency when scheme changes
  useEffect(() => {
    if (!filters.scheme) {
      setSchemeFrequency(null);
      return;
    }
    fetchSchemeStructure(filters.scheme)
      .then(resp => setSchemeFrequency(resp?.data?.frequency ?? null))
      .catch(() => setSchemeFrequency(null));
  }, [filters.scheme]);

  // Performance Optimization: Calculate periods only when inputs change
  const periods = useMemo(() => {
    switch (schemeFrequency) {
      case "Daily": {
        if (!periodInputs.dailyMonth) return [];
        const yearForDaily = filters.year || new Date().getFullYear();
        const lastDayOfMonth = new Date(yearForDaily, Number(periodInputs.dailyMonth), 0).getDate();
        const monthStart = `${yearForDaily}-${periodInputs.dailyMonth}-01`;
        const monthEnd = `${yearForDaily}-${periodInputs.dailyMonth}-${pad(lastDayOfMonth)}`;

        const s = dateToYYYYMMDD(periodInputs.dailyStartDate) || monthStart;
        const e = dateToYYYYMMDD(periodInputs.dailyEndDate) || monthEnd;

        const sClamped = new Date(s) < new Date(monthStart) ? monthStart : s;
        const eClamped = new Date(e) > new Date(monthEnd) ? monthEnd : e;
        return datesBetween(sClamped, eClamped);
      }
      case "Weekly": {
        const { weeklyStartDate, weeklyEndDate } = periodInputs;
        if (!weeklyStartDate || !weeklyEndDate) return [];
        return weeksBetween(weeklyStartDate, weeklyEndDate);
      }
      case "Monthly":
        return filters.year && filters.month ? [`${filters.year}-${filters.month}`] : [];
      case "Yearly": {
        const { yearStart, yearEnd } = periodInputs;
        return yearsBetween(yearStart, yearEnd);
      }
      default:
        return [];
    }
  }, [schemeFrequency, periodInputs, filters.year, filters.month]);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // FIXED: Only Scheme and State are mandatory
    if (!filters.scheme || !filters.state) {
      alert("Please select at least a Scheme and a State.");
      return;
    }

    setLoading(true);
    setError("");
    setDashboardData(null);
    setTimeSeriesData(null);

    try {
      const payload = {
        scheme_code: filters.scheme,
        state_code: filters.state,
        division_code: filters.division,
        district_code: filters.district,
        taluka_code: filters.taluka,
        year: filters.year,
        month: filters.month,
        frequency: schemeFrequency,
        periods,
      };

      const res = isTimeSeries
        ? await getTimeSeriesData(payload)
        : await getDashboardData(payload);
        console.log(res.data);

      isTimeSeries ? setTimeSeriesData(res.data) : setDashboardData(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [filters, isTimeSeries, schemeFrequency, periods]);

  // Configuration for the FilterPanel component
  const dropdowns = [
    { label: "Scheme", value: filters.scheme, onChange: (v) => setFilters(f => ({ ...f, scheme: v })), options: schemes.map((s) => ({ value: s.scheme_code, label: s.scheme_name })) },
    { label: "State", value: filters.state, onChange: (v) => setFilters(f => ({ ...f, state: v })), options: states.map((s) => ({ value: s.state_code, label: s.state_name })), disabled: !!localStorage.getItem("state_code") },
    { label: "Division", value: filters.division, onChange: (v) => setFilters(f => ({ ...f, division: v })), options: divisions.map((d) => ({ value: d.division_code, label: d.division_name })), disabled: !!localStorage.getItem("division_code") || !divisions.length },
    { label: "District", value: filters.district, onChange: (v) => setFilters(f => ({ ...f, district: v })), options: districts.map((d) => ({ value: d.district_code, label: d.district_name })), disabled: !!localStorage.getItem("district_code") || !districts.length },
    { label: "Taluka", value: filters.taluka, onChange: (v) => setFilters(f => ({ ...f, taluka: v })), options: talukas.map((t) => ({ value: t.taluka_code, label: t.taluka_name })), disabled: !!localStorage.getItem("taluka_code") || !talukas.length },
  ];

  return (
    <Box p={3}>
      <WelcomeBanner />
      <FilterPanel
        dropdowns={dropdowns}
        isTimeSeries={isTimeSeries}
        setIsTimeSeries={setIsTimeSeries}
        handleSubmit={handleSubmit}
        loading={loading}
      />

      <Box mt={2}>
        <Typography variant="body2">
          <strong>Scheme Frequency:</strong> {schemeFrequency || "—"}
        </Typography>
        {schemeFrequency && (
          <PeriodControls
            frequency={schemeFrequency}
            filters={filters}
            setFilters={setFilters}
            periodInputs={periodInputs}
            setPeriodInputs={setPeriodInputs}
            years={years}
            months={months}
            periodCount={periods.length}
          />
        )}
      </Box>

      {error && <Typography color="error">{error}</Typography>}
     {loading ? (
    <Grid container spacing={2}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Grid item xs={12} md={6} lg={3} key={i}>
          <Skeleton variant="rectangular" height={100} />
        </Grid>
      ))}
      {Array.from({ length: 2 }).map((_, i) => (
        <Grid item xs={12} md={6} key={i}>
          <Skeleton variant="rectangular" height={350} />
        </Grid>
      ))}
    </Grid>
  ) : (
    // THIS IS THE MODIFIED PART
    <>
      {dashboardData && !isTimeSeries && <Charts data={dashboardData} isTimeSeries={false} />}
      {timeSeriesData && isTimeSeries && <Charts data={timeSeriesData} isTimeSeries={true} />}
      {!dashboardData && !timeSeriesData && !loading && <EmptyState />}
    </>
    // END OF MODIFIED PART
  )}
    </Box>
  );
}