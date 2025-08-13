import React, { useState } from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts";
import { COLORS } from "./chartUtils";

export default function ChartSection({ section }) {
  const [chartType, setChartType] = useState(section.type || "bar");
  const { title, data } = section;

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Box border={1} borderRadius={2} p={2} m={1}>
        <Typography variant="body2" color="text.secondary">No chart data available</Typography>
      </Box>
    );
  }

  return (
    <Box border={1} borderRadius={2} p={2} m={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontSize={16}>{title}</Typography>
        <FormControl size="small">
          <InputLabel>Chart</InputLabel>
          <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="pie">Pie</MenuItem>
            <MenuItem value="jointBar">Joint Bar</MenuItem>
            <MenuItem value="line">Line</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {chartType === "bar" && (
        <BarChart width={500} height={300} data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      )}

      {chartType === "pie" && (
        <PieChart width={500} height={300}>
          <Pie data={data} outerRadius={100} dataKey="value" nameKey="name" label>
            {data.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}

      {chartType === "jointBar" && (
        <BarChart width={500} height={300} data={[Object.fromEntries(data.map(({ name, value }) => [name, value]))]}>
          <XAxis />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.map((item, i) => (
            <Bar key={item.name} dataKey={item.name} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      )}

      {chartType === "line" && (
        <LineChart width={500} height={300} data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line dataKey="value" stroke="#82ca9d" />
        </LineChart>
      )}
    </Box>
  );
}
