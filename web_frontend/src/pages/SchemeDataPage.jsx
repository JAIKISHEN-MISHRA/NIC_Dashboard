// SchemeDataPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  fetchSchemeData,
  updateSchemeData,
  fetchSchemes,
  fetchSchemeStructure,
} from "../services/api";

export default function SchemeDataPage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState({});

  // frequency & period state
  const [schemeFrequency, setSchemeFrequency] = useState(null);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [dailyMonth, setDailyMonth] = useState("");
  const [dailyStartDate, setDailyStartDate] = useState("");
  const [dailyEndDate, setDailyEndDate] = useState("");
  const [weeklyStartDate, setWeeklyStartDate] = useState("");
  const [weeklyEndDate, setWeeklyEndDate] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [periods, setPeriods] = useState([]);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = ["01","02","03","04","05","06","07","08","09","10","11","12"];

  // load schemes list
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchSchemes();
        setSchemes(res?.data ?? res ?? []);
      } catch (err) {
        console.error("Failed to load schemes", err);
      }
    })();
  }, []);

  // Helper - flatten nested objects (you already had this)
  const flattenObject = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix} - ${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(acc, flattenObject(value, newKey));
      } else {
        acc[newKey] = value;
      }

      return acc;
    }, {});
  };

  // --- period helpers (same logic as Dashboard) ---
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
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = ((day + 6) % 7); // 0 if Monday
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

  // compute periods reactively
  React.useEffect(() => {
    if (schemeFrequency === "Daily") {
      if (!dailyMonth) {
        setPeriods([]);
        return;
      }
      const nowYear = year || new Date().getFullYear();
      let start = dailyStartDate || `${nowYear}-${dailyMonth}-01`;
      if (!dailyEndDate) {
        const last = new Date(nowYear, Number(dailyMonth), 0).getDate();
        const end = `${nowYear}-${dailyMonth}-${pad(last)}`;
        setDailyStartDate(start);
        setDailyEndDate(end);
        setPeriods(datesBetween(start, end));
      } else {
        const last = new Date(nowYear, Number(dailyMonth), 0).getDate();
        const monthStart = `${nowYear}-${dailyMonth}-01`;
        const monthEnd = `${nowYear}-${dailyMonth}-${pad(last)}`;
        const s = dateToYYYYMMDD(dailyStartDate) || monthStart;
        const e = dateToYYYYMMDD(dailyEndDate) || monthEnd;
        const sClamped = new Date(s) < new Date(monthStart) ? monthStart : s;
        const eClamped = new Date(e) > new Date(monthEnd) ? monthEnd : e;
        setPeriods(datesBetween(sClamped, eClamped));
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
      if (!month || !year) {
        setPeriods([]);
        return;
      }
      setPeriods([`${year}-${month}`]);
    } else if (schemeFrequency === "Yearly") {
      if (!yearStart || !yearEnd) {
        setPeriods([]);
        return;
      }
      setPeriods(yearsBetween(yearStart, yearEnd));
    } else {
      setPeriods([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemeFrequency, dailyMonth, dailyStartDate, dailyEndDate, weeklyStartDate, weeklyEndDate, month, year, yearStart, yearEnd]);

  // load scheme frequency (and optionally structure) when scheme selected
  const handleSchemeSelect = async (code) => {
    setSelectedScheme(code);
    setRows([]);
    setPage(0);
    setSchemeFrequency(null);
    setPeriods([]);
    setYear("");
    setMonth("");
    setDailyMonth("");
    setDailyStartDate("");
    setDailyEndDate("");
    setWeeklyStartDate("");
    setWeeklyEndDate("");
    setYearStart("");
    setYearEnd("");

    if (!code) return;

    try {
      setLoading(true);
      // fetch scheme structure which contains frequency (we added it earlier)
      const structResp = await fetchSchemeStructure(code);
      const payload = structResp?.data ?? structResp ?? {};
      setSchemeFrequency(payload.frequency ?? null);

      // initial fetch of data for scheme (no periods => backend can decide default behavior)
      await loadSchemeData(code, { frequency: payload.frequency, periods: [] });
    } catch (err) {
      console.error("Failed to load scheme structure or data", err);
    } finally {
      setLoading(false);
    }
  };

  // load scheme data: accepts optional options object { frequency, periods, year, month, page }
  const loadSchemeData = async (schemeCode, opts = {}) => {
    setLoading(true);
    try {
      // Build params/payload for API - adapt to your API signature
      const payload = {
        scheme_code: schemeCode,
        frequency: opts.frequency ?? schemeFrequency,
        periods: opts.periods ?? periods,
        year: opts.year ?? year,
        month: opts.month ?? month,
        page: opts.page ?? page + 1, // if backend is 1-based
        page_size: rowsPerPage,
      };

      // Try to call fetchSchemeData in flexible ways depending on your service implementation
      // Many clients use: fetchSchemeData(schemeCode, { params: payload }) or fetchSchemeData(payload)
      let res;
      try {
        // attempt: fetchSchemeData(schemeCode, payload)
        res = await fetchSchemeData(schemeCode, payload);
      } catch (err) {
        // fallback: fetchSchemeData(payload)
        res = await fetchSchemeData(payload);
      }

      const dataRows = res?.data?.data ?? res?.data ?? res ?? [];

      // flatten rows (data might be array of objects with `data` JSON field)
      const normalized = (Array.isArray(dataRows) ? dataRows : []).map((item) => {
        // if item has a `data` JSONB column (object), merge top-level fields and flatten it
        const base = { ...item };
        if (item.data && typeof item.data === "object") {
          delete base.data;
          const flattened = flattenObject(item.data);
          return { ...base, ...flattened };
        }
        return flattenObject(base);
      });

      setRows(normalized);
    } catch (err) {
      console.error("Error fetching scheme data:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPeriods = async () => {
    if (!selectedScheme) return;
    // basic validation for frequency types
    if (schemeFrequency && ["Daily","Weekly","Monthly","Yearly"].includes(schemeFrequency) && periods.length === 0) {
      alert("Please select period(s) for this frequency.");
      return;
    }
    await loadSchemeData(selectedScheme, { frequency: schemeFrequency, periods, year, month, page: 1 });
    setPage(0);
  };

  // Edit/save handlers (keep yours)
  const handleEditClick = (row) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateSchemeData(selectedScheme, editRow.id, editRow);
      setRows((prev) => prev.map((r) => (r.id === editRow.id ? editRow : r)));
    } catch (err) {
      console.error("Failed to save edit", err);
    } finally {
      setEditOpen(false);
    }
  };

  return (
    <>
      <Box p={3}>
        <Typography variant="h5" mb={2}>
          Scheme Data Viewer
        </Typography>

        <FormControl sx={{ mb: 2, minWidth: 250 }}>
          <InputLabel>Scheme</InputLabel>
          <Select
            value={selectedScheme}
            label="Scheme"
            onChange={(e) => handleSchemeSelect(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select a Scheme</MenuItem>
            {schemes.map((scheme) => (
              <MenuItem key={scheme.scheme_code} value={scheme.scheme_code}>
                {scheme.scheme_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Frequency display + simple period controls */}
        {schemeFrequency && (
          <Box mb={2}>
            <Typography variant="subtitle2">Frequency: {schemeFrequency}</Typography>

            {/* Daily */}
            {schemeFrequency === "Daily" && (
              <Box display="flex" gap={2} alignItems="center" mt={1} flexWrap="wrap">
                <FormControl size="small">
                  <InputLabel>Year</InputLabel>
                  <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Month</InputLabel>
                  <Select value={dailyMonth} label="Month" onChange={(e) => setDailyMonth(e.target.value)}>
                    <MenuItem value=""><em>Choose</em></MenuItem>
                    {months.map((m, idx) => (<MenuItem key={idx} value={String(idx + 1).padStart(2,"0")}>{m}</MenuItem>))}
                  </Select>
                </FormControl>

                <div>
                  <label>Start</label><br />
                  <input type="date" value={dailyStartDate} onChange={(e) => setDailyStartDate(e.target.value)} />
                </div>

                <div>
                  <label>End</label><br />
                  <input type="date" value={dailyEndDate} onChange={(e) => setDailyEndDate(e.target.value)} />
                </div>

                <Button variant="contained" onClick={handleApplyPeriods}>Apply</Button>
              </Box>
            )}

            {/* Weekly */}
            {schemeFrequency === "Weekly" && (
              <Box display="flex" gap={2} alignItems="center" mt={1} flexWrap="wrap">
                <div>
                  <label>Start</label><br />
                  <input type="date" value={weeklyStartDate} onChange={(e) => setWeeklyStartDate(e.target.value)} />
                </div>
                <div>
                  <label>End</label><br />
                  <input type="date" value={weeklyEndDate} onChange={(e) => setWeeklyEndDate(e.target.value)} />
                </div>
                <Button variant="contained" onClick={handleApplyPeriods}>Apply</Button>
              </Box>
            )}

            {/* Monthly */}
            {schemeFrequency === "Monthly" && (
              <Box display="flex" gap={2} alignItems="center" mt={1}>
                <FormControl size="small">
                  <InputLabel>Year</InputLabel>
                  <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Month</InputLabel>
                  <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
                    <MenuItem value=""><em>Choose</em></MenuItem>
                    {months.map((m, idx) => (<MenuItem key={idx} value={String(idx + 1).padStart(2,"0")}>{m}</MenuItem>))}
                  </Select>
                </FormControl>

                <Button variant="contained" onClick={handleApplyPeriods}>Apply</Button>
              </Box>
            )}

            {/* Yearly */}
            {schemeFrequency === "Yearly" && (
              <Box display="flex" gap={2} alignItems="center" mt={1}>
                <FormControl size="small">
                  <InputLabel>Start Year</InputLabel>
                  <Select value={yearStart} label="Start Year" onChange={(e) => setYearStart(e.target.value)}>
                    <MenuItem value=""><em>Start</em></MenuItem>
                    {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>End Year</InputLabel>
                  <Select value={yearEnd} label="End Year" onChange={(e) => setYearEnd(e.target.value)}>
                    <MenuItem value=""><em>End</em></MenuItem>
                    {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>

                <Button variant="contained" onClick={handleApplyPeriods}>Apply</Button>
              </Box>
            )}
          </Box>
        )}

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          selectedScheme && (
            <>
              <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {rows.length > 0 &&
                        Object.keys(rows[0]).map((key) => (
                          <TableCell
                            key={key}
                            sx={{
                              backgroundColor: "#f5f5f5",
                              fontWeight: "bold",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {key}
                          </TableCell>
                        ))}
                      <TableCell
                        sx={{
                          backgroundColor: "#f5f5f5",
                          fontWeight: "bold",
                          position: "sticky",
                          right: 0,
                          zIndex: 2,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, rowIndex) => (
                        <TableRow
                          key={row.id || rowIndex}
                          sx={{
                            backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "#fff",
                          }}
                        >
                          {Object.keys(row).map((key) => (
                            <TableCell
                              key={key}
                              sx={{
                                whiteSpace: "nowrap",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {String(row[key] ?? "")}
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{
                              position: "sticky",
                              right: 0,
                              backgroundColor: "#fff",
                            }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleEditClick(row)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Box>

              <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[20]}
              />
            </>
          )
        )}
      </Box>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Row</DialogTitle>
        <DialogContent>
          {Object.keys(editRow).map((key) => (
            key !== "id" && (
              <TextField
                key={key}
                label={key}
                fullWidth
                margin="dense"
                value={editRow[key] ?? ""}
                onChange={(e) =>
                  setEditRow((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            )
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
