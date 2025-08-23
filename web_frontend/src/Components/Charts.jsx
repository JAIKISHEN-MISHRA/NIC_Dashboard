// src/Components/Charts.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Tooltip as MuiTooltip,
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import SmartChart from "./SmartChart";
import {
  extractChartSections,
  transformTimeSeriesData,
  deepGet,
  COLORS,
} from "./chartUtils";

import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

export default function Charts({ data, stats = null, explanations = null, timeSeries = false }) {
  const [insight, setInsight] = useState(null);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [chartSelections, setChartSelections] = useState({});
  const [chartTypes, setChartTypes] = useState({}); // each primaryKey -> "line"|"bar"|"area"

  const chartData = useMemo(() => {
    if (!data) return null;
    if (timeSeries) {
      const transformed = transformTimeSeriesData(data);
      return { mode: "time", time: transformed };
    }
    const sections = extractChartSections(data);
    return { mode: "summary", sections };
  }, [data, timeSeries]);

  // initialize selections and default chart types when time series becomes available
  useEffect(() => {
    if (chartData?.mode === "time" && Array.isArray(chartData.time?.keys) && chartData.time.keys.length > 0) {
      const initialSelections = {};
      const initialTypes = {};
      for (const key of chartData.time.keys) {
        initialSelections[key] = [key];
        initialTypes[key] = "line";
      }
      setChartSelections(initialSelections);
      setChartTypes(initialTypes);
    }
  }, [chartData]);

  if (!chartData)
    return <Typography sx={{ p: 2, color: "text.secondary" }}>No data available to display charts.</Typography>;

  // ----------------------
  // Time series mode
  // ----------------------
  if (chartData.mode === "time") {
    const { data: tsData, keys: allKeys } = chartData.time || { data: [], keys: [] };
    if (!Array.isArray(tsData) || tsData.length === 0)
      return <Typography sx={{ p: 2, color: "text.secondary" }}>No time series data points found.</Typography>;

    const handleSelectionChange = (primaryKey, event) => {
      const {
        target: { value },
      } = event;
      setChartSelections((prev) => ({
        ...prev,
        [primaryKey]: typeof value === "string" ? value.split(",") : value,
      }));
    };

    const handleChartTypeChange = (primaryKey, value) => {
      setChartTypes((prev) => ({ ...prev, [primaryKey]: value }));
    };

    // dynamic chart renderer (line / bar / area)
    const renderChart = (primaryKey, height = 400) => {
      const type = chartTypes[primaryKey] || "line";
      const selected = chartSelections[primaryKey] || [];

      if (type === "bar") {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={tsData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selected.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[allKeys.indexOf(key) % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      if (type === "area") {
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={tsData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selected.map((key) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[allKeys.indexOf(key) % COLORS.length]}
                  fill={COLORS[allKeys.indexOf(key) % COLORS.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      // default: Line chart
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={tsData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            {(chartSelections[primaryKey] || []).map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[allKeys.indexOf(key) % COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    };

    const selectionKeys = Object.keys(chartSelections || {});

    return (
      <Box p={3}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          📈 Time Series Analysis
        </Typography>

        <Grid container spacing={3}>
          {selectionKeys.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" sx={{ p: 2 }}>
                Preparing charts...
              </Typography>
            </Grid>
          ) : (
            selectionKeys.map((primaryKey) => (
              <Grid item xs={12} key={primaryKey}>
                {/* Ensure the immediate child of Zoom is a real DOM node (div) */}
                <Zoom in mountOnEnter unmountOnExit>
                  <div>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: 3,
                        transition: "0.3s",
                        "&:hover": { boxShadow: 6 },
                      }}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {primaryKey}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                              <InputLabel id={`chart-type-label-${primaryKey}`}>Chart Type</InputLabel>
                              <Select
                                labelId={`chart-type-label-${primaryKey}`}
                                value={chartTypes[primaryKey] || "line"}
                                label="Chart Type"
                                onChange={(e) => handleChartTypeChange(primaryKey, e.target.value)}
                                input={<OutlinedInput label="Chart Type" />}
                                size="small"
                              >
                                <MenuItem value="line">Line</MenuItem>
                                <MenuItem value="bar">Bar</MenuItem>
                                <MenuItem value="area">Area</MenuItem>
                              </Select>
                            </FormControl>

                            <MuiTooltip title="Fullscreen">
                              <IconButton onClick={() => setFullscreenChart(primaryKey)}>
                                <OpenInFullIcon />
                              </IconButton>
                            </MuiTooltip>
                          </Box>
                        </Box>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Add metrics to compare</InputLabel>
                          <Select
                            multiple
                            value={chartSelections[primaryKey] || []}
                            onChange={(e) => handleSelectionChange(primaryKey, e)}
                            input={<OutlinedInput label="Add metrics to compare" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} color="primary" size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {(allKeys || []).map((key) => (
                              <MenuItem key={key} value={key}>
                                {key}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        {renderChart(primaryKey, 400)}
                      </CardContent>
                    </Card>
                  </div>
                </Zoom>
              </Grid>
            ))
          )}
        </Grid>

        {/* FULLSCREEN DIALOG */}
        <Dialog
          open={!!fullscreenChart}
          onClose={() => setFullscreenChart(null)}
          fullScreen
          sx={{ backdropFilter: "blur(5px)" }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 600,
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            {fullscreenChart} — Fullscreen View
            <IconButton onClick={() => setFullscreenChart(null)} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ bgcolor: "background.default", p: 3 }}>
            {fullscreenChart && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  {fullscreenChart} — Compare Metrics
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartTypes[fullscreenChart] || "line"}
                    onChange={(e) => handleChartTypeChange(fullscreenChart, e.target.value)}
                    input={<OutlinedInput label="Chart Type" />}
                  >
                    <MenuItem value="line">Line</MenuItem>
                    <MenuItem value="bar">Bar</MenuItem>
                    <MenuItem value="area">Area</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Add metrics to compare</InputLabel>
                  <Select
                    multiple
                    value={chartSelections[fullscreenChart] || []}
                    onChange={(e) => {
                      const {
                        target: { value },
                      } = e;
                      setChartSelections((prev) => ({
                        ...prev,
                        [fullscreenChart]: typeof value === "string" ? value.split(",") : value,
                      }));
                    }}
                    input={<OutlinedInput label="Add metrics to compare" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} color="primary" size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {(chartData.time?.keys || []).map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {renderChart(fullscreenChart, 600)}
              </>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    );
  }

  // ----------------------
  // Summary mode (unchanged)
  // ----------------------
  const { sections = [] } = chartData;

  const handleItemClick = (path, rowOrSlice) => {
    const detail = stats ? deepGet(stats, path) : undefined;
    setInsight({ path, clicked: rowOrSlice, detail });
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        📊 Dashboard Summary
      </Typography>

      {explanations && typeof explanations === "object" && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">Quick explanations</Typography>
            <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
              {Object.entries(explanations).map(([k, v]) => `${k}: ${String(v)}`).join("\n")}
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {(sections || []).length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" sx={{ p: 2 }}>
              No summary sections available.
            </Typography>
          </Grid>
        ) : (
          sections.map((section, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              {/* Make Zoom's direct child a DOM node to avoid findDOMNode/null issues */}
              <Zoom in mountOnEnter unmountOnExit>
                <div>
                  <SmartChart section={section} onItemClick={handleItemClick} />
                </div>
              </Zoom>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={!!insight} onClose={() => setInsight(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600 }}>
          Insights
          <IconButton onClick={() => setInsight(null)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {!insight?.detail ? (
            <Typography variant="body2" color="text.secondary">No insights found for this item.</Typography>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Path: {insight.path.join(" › ")}
              </Typography>
              <Table size="small">
                <TableBody>
                  {Object.entries(insight.detail).map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell sx={{ fontWeight: 600, width: 160 }}>{k}</TableCell>
                      <TableCell>
                        {Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
