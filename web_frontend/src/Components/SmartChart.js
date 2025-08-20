// src/Components/charts/SmartChart.js
import React, { useState } from "react";
import { Box, Typography, FormControl, Select, MenuItem, InputLabel, Card, CardContent } from "@mui/material";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from "recharts";
import { COLORS } from "./chartUtils";

export default function SmartChart({ section }) {
  const { title, data, pieData, keys, defaultChartType } = section;
  const [chartType, setChartType] = useState(defaultChartType || "bar");

  // Don't render if there's no data to display
  if (!data || data.length === 0) {
    return null;
  }

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, i) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} />
            ))}
          </LineChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie data={pieData} outerRadius="80%" dataKey="value" nameKey="name" label>
              {pieData.map((entry, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );
      case "bar":
      default:
        return (
          <BarChart data={data}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            {keys.map((key, i) => (
               <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontSize={16}>{title}</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart</InputLabel>
            <Select value={chartType} onChange={(e) => setChartType(e.target.value)} label="Chart">
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: '100%', height: 350 }}>
          <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}