import React, { useEffect, useState, useCallback } from "react";
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
import { Box, Typography, Grid, Skeleton } from "@mui/material";
import WelcomeBanner from "../Components/WelcomeBanner";
import FilterPanel from "../Components/FilterPanel";
import EmptyState from "../Components/EmptyState";

export default function AdminDashboard() {
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

  // Fetch initial data
useEffect(() => {
    localStorage.setItem("state_code", "27");
    localStorage.setItem("division_code","02")
    localStorage.setItem("district_code","480");
    localStorage.setItem("taluka_code","4294")
  setLoading(true);

  const lsState = localStorage.getItem("state_code") || "";
  const lsDivision = localStorage.getItem("division_code") || "";
  const lsDistrict = localStorage.getItem("district_code") || "";
  const lsTaluka = localStorage.getItem("taluka_code") || "";

  Promise.all([fetchSchemes(), getStates()])
    .then(async ([schemeRes, stateRes]) => {
      setSchemes(schemeRes?.data || []);
      setStates(stateRes?.data || []);

      // If state_code exists, set it and fetch next level
      if (lsState) {
        setSelectedState(lsState);

        const divisionRes = await getDivisions(lsState);
        setDivisions(divisionRes.data || []);

        if (lsDivision) {
          setSelectedDivision(lsDivision);

          const districtRes = await getDistricts(lsState, lsDivision);
          setDistricts(districtRes.data || []);

          if (lsDistrict) {
            setSelectedDistrict(lsDistrict);

            const talukaRes = await getTalukas(lsState, lsDivision, lsDistrict);
            setTalukas(talukaRes.data || []);

            if (lsTaluka) {
              setSelectedTaluka(lsTaluka);
            }
          }
        }
      }
    })
    .catch(() => setError("Failed to load initial data."))
    .finally(() => setLoading(false));
}, []);


  useEffect(() => {
    if (!selectedState) return;
    getDivisions(selectedState).then((res) => {
      setDivisions(res.data || []);
 if (!localStorage.getItem("division_code")) {
      setSelectedDivision("");
    }      setDistricts([]);
      setTalukas([]);
    });
  }, [selectedState]);

  useEffect(() => {
    if (!selectedDivision) return;
    getDistricts(selectedState, selectedDivision).then((res) => {
      setDistricts(res.data || []);

      if (!localStorage.getItem("district_code")) {
  setSelectedDistrict("");
}
      setTalukas([]);
    });
  }, [selectedDivision, selectedState]);

  useEffect(() => {
    if (!selectedDistrict) return;
    getTalukas(selectedState, selectedDivision, selectedDistrict).then((res) => {
      setTalukas(res.data || []);
      if (!localStorage.getItem("taluka_code")) {
  setSelectedTaluka("");
}
    });
  }, [selectedDistrict, selectedDivision, selectedState]);

  const handleSubmit = useCallback(async () => {
    if (!selectedScheme || !selectedState) {
      alert("Please select at least Scheme and State.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = isTimeSeries
        ? await getTimeSeriesData({
            scheme_code: selectedScheme,
            state_code: selectedState,
            division_code: selectedDivision,
            district_code: selectedDistrict,
            taluka_code: selectedTaluka,
          })
        : await getDashboardData({
            scheme_code: selectedScheme,
            state_code: selectedState,
            division_code: selectedDivision,
            district_code: selectedDistrict,
            taluka_code: selectedTaluka,
            year,
            month,
          });

      isTimeSeries ? setTimeSeriesData(res.data) : setDashboardData(res.data);
    } catch {
      setError("Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [
    selectedScheme,
    selectedState,
    selectedDivision,
    selectedDistrict,
    selectedTaluka,
    year,
    month,
    isTimeSeries,
  ]);

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
    disabled: !!localStorage.getItem("state_code"),
  },
  {
    label: "Division",
    value: selectedDivision,
    onChange: setSelectedDivision,
    options: divisions.map((d) => ({ value: d.division_code, label: d.division_name })),
    disabled: !!localStorage.getItem("division_code") || !divisions.length,
  },
  {
    label: "District",
    value: selectedDistrict,
    onChange: setSelectedDistrict,
    options: districts.map((d) => ({ value: d.district_code, label: d.district_name })),
    disabled: !!localStorage.getItem("district_code") || !districts.length,
  },
  {
    label: "Taluka",
    value: selectedTaluka,
    onChange: setSelectedTaluka,
    options: talukas.map((t) => ({ value: t.taluka_code, label: t.taluka_name })),
    disabled: !!localStorage.getItem("taluka_code") || !talukas.length,
  },
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

      {error && <Typography color="error">{error}</Typography>}
      {loading && (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      )}

      {!loading && !error && (
        <>
          {!isTimeSeries && dashboardData && <Charts data={dashboardData} />}
          {isTimeSeries && timeSeriesData && <Charts timeSeries data={timeSeriesData} />}

          {!dashboardData && !timeSeriesData && <EmptyState />}
        </>
      )}
    </Box>
  );
}
