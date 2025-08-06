// File: src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  fetchSchemes,
  getDashboardData,
  getTimeSeriesData,
} from "../services/api";
import Charts from "../Components/Charts";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";

export default function Dashboard() {
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [schemes, setSchemes] = useState([]);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluka, setSelectedTaluka] = useState("");
  const [selectedScheme, setSelectedScheme] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [dashboardData, setDashboardData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTimeSeries, setIsTimeSeries] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

  useEffect(() => {
    fetchSchemes().then((res) => res.data && setSchemes(res.data));
    getStates().then((res) => res.data && setStates(res.data));
  }, []);

  useEffect(() => {
    if (selectedState) {
      getDivisions(selectedState).then((res) => {
        setDivisions(res.data || []);
        setSelectedDivision("");
        setDistricts([]);
        setSelectedDistrict("");
        setTalukas([]);
        setSelectedTaluka("");
      });
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDivision) {
      getDistricts(selectedState, selectedDivision).then((res) => {
        setDistricts(res.data || []);
        setSelectedDistrict("");
        setTalukas([]);
        setSelectedTaluka("");
      });
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (selectedDistrict) {
      getTalukas(selectedState, selectedDivision, selectedDistrict).then((res) => {
        setTalukas(res.data || []);
        setSelectedTaluka("");
      });
    }
  }, [selectedDistrict]);

  const handleSubmit = async () => {
    if (!selectedScheme || !selectedState) {
      alert("Please select at least Scheme and State.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isTimeSeries) {
        const res = await getTimeSeriesData({
          scheme_code: selectedScheme,
          state_code: selectedState,
          division_code: selectedDivision,
          district_code: selectedDistrict,
          taluka_code: selectedTaluka,
        });
        setTimeSeriesData(res.data);
        console.log(res.data)
      } else {
        const res = await getDashboardData({
          scheme_code: selectedScheme,
          state_code: selectedState,
          division_code: selectedDivision,
          district_code: selectedDistrict,
          taluka_code: selectedTaluka,
          year,
          month,
        });
        setDashboardData(res.data);
        console.log(res.data);
      }
    } catch (err) {
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const dropdowns = [
    {
      label: "Scheme",
      value: selectedScheme,
      onChange: setSelectedScheme,
      options: schemes.map((s) => ({ value: s.scheme_code, label: s.scheme_name })),
    },
    {
      label: "Year",
      value: year,
      onChange: setYear,
      options: years.map((y) => ({ value: y, label: y })),
    },
    {
      label: "Month",
      value: month,
      onChange: setMonth,
      options: months.map((m) => ({ value: m, label: m })),
    },
    {
      label: "State",
      value: selectedState,
      onChange: setSelectedState,
      options: states.map((s) => ({ value: s.state_code, label: s.state_name })),
    },
    {
      label: "Division",
      value: selectedDivision,
      onChange: setSelectedDivision,
      options: divisions.map((d) => ({ value: d.division_code, label: d.division_name })),
      disabled: !divisions.length,
    },
    {
      label: "District",
      value: selectedDistrict,
      onChange: setSelectedDistrict,
      options: districts.map((d) => ({ value: d.district_code, label: d.district_name })),
      disabled: !districts.length,
    },
    {
      label: "Taluka",
      value: selectedTaluka,
      onChange: setSelectedTaluka,
      options: talukas.map((t) => ({ value: t.taluka_code, label: t.taluka_name })),
      disabled: !talukas.length,
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        {dropdowns.map(({ label, value, onChange, options, disabled = false }) => (
          <FormControl key={label} disabled={disabled} sx={{ minWidth: 140 }}>
            {/* <InputLabel>{label}</InputLabel> */}
            <Select value={value} onChange={(e) => onChange(e.target.value)} displayEmpty>
              <MenuItem value="">Select {label}</MenuItem>
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>View Mode</InputLabel>
          <Select
            value={isTimeSeries ? "time" : "summary"}
            onChange={(e) => {
              setIsTimeSeries(e.target.value === "time");
              setDashboardData(null);
              setTimeSeriesData(null);
            }}
          >
            <MenuItem value="summary">Summary View</MenuItem>
            <MenuItem value="time">Time Series View</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSubmit}>
          Show Charts
        </Button>
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!isTimeSeries && dashboardData && <Charts data={dashboardData} />}
      {isTimeSeries && timeSeriesData && <Charts timeSeries data={timeSeriesData} />}
    </Box>
  );
}
