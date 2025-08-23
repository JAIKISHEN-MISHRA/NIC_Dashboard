// src/Components/charts/SmartChart.js
import React, { useMemo, useState } from "react";
import {
  Box, Typography, FormControl, Select, MenuItem, InputLabel,
  Card, CardContent, ToggleButton, ToggleButtonGroup, Stack,
} from "@mui/material";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { COLORS } from "./chartUtils";

export default function SmartChart({ section, onItemClick }) {
  const {
    title = "Chart",
    data = [],
    pieData = [],
    keys = [],
    defaultChartType = "bar",
    pathMap = null,                 // <-- NEW
  } = section || {};

  const [chartType, setChartType] = useState(defaultChartType || "bar");
  const [barMode, setBarMode] = useState("group");
  const [topN, setTopN] = useState("all");

  const categoryKey = useMemo(() => {
    if (!data || data.length === 0) return "name";
    const first = data[0];
    if ("name" in first) return "name";
    if ("label" in first) return "label";
    for (const k of Object.keys(first)) {
      if (typeof first[k] === "string") return k;
    }
    return Object.keys(first)[0] || "name";
  }, [data]);

  const processed = useMemo(() => {
    if (!data) return { rows: [], keys: [] };
    const rows = data.map(r => ({ ...r }));
    const detectedKeys = keys && keys.length ? keys : (() => {
      if (!rows.length) return [];
      return Object.keys(rows[0]).filter(k => k !== categoryKey && typeof rows[0][k] === "number");
    })();

    rows.forEach(r => {
      let total = 0;
      detectedKeys.forEach(k => { const v = Number(r[k]); if (!Number.isNaN(v)) total += v; });
      r._total = total;
    });

    rows.sort((a, b) => b._total - a._total);
    const limit = topN === "all" ? rows.length : Number(topN);
    return { rows: rows.slice(0, limit), keys: detectedKeys };
  }, [data, keys, topN, categoryKey]);

  if (!data || data.length === 0) return null;
  const { rows, keys: metricKeys } = processed;
  if (!rows || rows.length === 0) return null;

  const clickable = !!pathMap && typeof pathMap === "object";

  const renderBar = () => (
    <BarChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={categoryKey} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={48} />
      <YAxis />
      <Tooltip />
      <Legend />
      {metricKeys.map((k, i) => (
        <Bar
          key={k}
          dataKey={k}
          name={k}
          stackId={barMode === "stack" ? "stack" : undefined}
          fill={COLORS[i % COLORS.length]}
          isAnimationActive={false}
        >
          {/* Make each category clickable when we have a pathMap and single series 'value' */}
          {k === "value" && clickable &&
            rows.map((row, idx) => (
              <Cell
                key={`cell-${idx}`}
                onClick={() => {
                  const name = row[categoryKey];
                  const path = pathMap[name];
                  if (path && onItemClick) onItemClick(path, row);
                }}
              />
            ))
          }
        </Bar>
      ))}
    </BarChart>
  );

  const renderLine = () => (
    <LineChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 40 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={categoryKey} tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={48} />
      <YAxis />
      <Tooltip />
      <Legend />
      {metricKeys.map((k, i) => (
        <Line
          key={k}
          type="monotone"
          dataKey={k}
          stroke={COLORS[i % COLORS.length]}
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
          onClick={(e) => {
            if (!clickable || k !== "value") return;
            const name = e && e.payload && e.payload[categoryKey];
            const path = name ? pathMap[name] : null;
            if (path && onItemClick) onItemClick(path, e.payload);
          }}
        />
      ))}
    </LineChart>
  );

  const renderPie = () => {
    const base = pieData.length ? pieData : rows.map(r => ({ name: r[categoryKey], value: r._total }));
    return (
      <PieChart>
        <Tooltip />
        <Legend verticalAlign="bottom" />
        <Pie data={base} dataKey="value" nameKey="name" outerRadius={110} label>
          {base.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={COLORS[i % COLORS.length]}
              onClick={() => {
                if (!clickable) return;
                const path = pathMap[entry.name];
                if (path && onItemClick) onItemClick(path, entry);
              }}
            />
          ))}
        </Pie>
      </PieChart>
    );
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontSize={16}>{title}</Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Chart</InputLabel>
              <Select value={chartType} onChange={(e) => setChartType(e.target.value)} label="Chart">
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
              </Select>
            </FormControl>

            {chartType === "bar" && (
              <ToggleButtonGroup
                value={barMode}
                exclusive
                size="small"
                onChange={(e, v) => { if (v) setBarMode(v); }}
                aria-label="bar-mode"
              >
                <ToggleButton value="group">Grouped</ToggleButton>
                <ToggleButton value="stack">Stacked</ToggleButton>
              </ToggleButtonGroup>
            )}

            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Top</InputLabel>
              <Select value={topN} onChange={(e) => setTopN(e.target.value)} label="Top">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value={5}>Top 5</MenuItem>
                <MenuItem value={10}>Top 10</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        <Box sx={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            {chartType === "pie" ? renderPie() : chartType === "line" ? renderLine() : renderBar()}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
