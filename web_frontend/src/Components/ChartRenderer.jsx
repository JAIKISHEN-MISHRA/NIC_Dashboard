// src/components/ChartRenderer.jsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

export default function ChartRenderer({ type, title, data, colors }) {
  const [chartType, setChartType] = useState(type || "bar");

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No chart data available
      </Typography>
    );
  }

  return (
    <Box>
      {title && (
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="h6" fontSize={16} noWrap>
            {title}
          </Typography>
          <FormControl size="small">
            <InputLabel>Chart</InputLabel>
            <Select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="pie">Pie</MenuItem>
              <MenuItem value="jointBar">Joint Bar</MenuItem>
              <MenuItem value="line">Line</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      <ResponsiveContainer width="100%" height={300}>
        {chartType === "bar" && (
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        )}

        {chartType === "pie" && (
          <PieChart>
            <Pie
              data={data}
              outerRadius={100}
              dataKey="value"
              nameKey="name"
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}

        {chartType === "jointBar" && (
          <BarChart
            data={[Object.fromEntries(data.map(({ name, value }) => [name, value]))]}
          >
            <XAxis />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.map((item, i) => (
              <Bar
                key={item.name}
                dataKey={item.name}
                fill={colors[i % colors.length]}
              />
            ))}
          </BarChart>
        )}

        {chartType === "line" && (
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="value" stroke={colors[1]} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Box>
  );
}
