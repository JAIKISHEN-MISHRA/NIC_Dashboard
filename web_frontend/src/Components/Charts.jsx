// File: src/components/Charts.jsx
import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#00C49F",
  "#FFBB28",
  "#0088FE",
  "#FF4444",
];

const extractChartSections = (obj, parentTitle = "") => {
  const sections = [];

  if (typeof obj !== "object" || obj === null) return sections;

  const chartData = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number") {
      chartData.push({ name: key, value });
    } else if (typeof value === "object" && value !== null) {
      const childSections = extractChartSections(
        value,
        parentTitle ? `${parentTitle} > ${key}` : key
      );
      sections.push(...childSections);
    }
  }

  if (chartData.length > 0) {
    sections.unshift({
      title: parentTitle || "Summary",
      data: chartData,
    });
  }

  return sections;
};

const transformTimeSeries = (raw) => {
  const output = {};
  raw.forEach(({ year, month, data }) => {
    const label = `${month}/${year}`;
    const sections = extractChartSections(data);
    for (const section of sections) {
      if (!output[section.title]) output[section.title] = [];
      const entry = { label };
      section.data.forEach((item) => {
        entry[item.name] = item.value;
      });
      output[section.title].push(entry);
    }
  });
  return output;
};

export default function Charts({ data, timeSeries = false }) {
  if (!data || typeof data !== "object") return <Typography>No data available.</Typography>;

  if (timeSeries) {
    const series = transformTimeSeries(data);

    return (
      <Box>
        <Typography variant="h5" mb={2}>
          Time Series Charts
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(series).map(([title, seriesData], idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Box border={1} borderRadius={2} p={2} m={1}>
                <Typography variant="h6" fontSize={16}>
                  {title}
                </Typography>
                <LineChart width={500} height={300} data={seriesData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {Object.keys(seriesData[0] || {})
                    .filter((k) => k !== "label")
                    .map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[i % COLORS.length]}
                      />
                    ))}
                </LineChart>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const sections = extractChartSections(data);

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Dashboard Insights
      </Typography>
      <Grid container spacing={2}>
        {sections.map((section, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <ChartSection section={section} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function ChartSection({ section }) {
  const [chartType, setChartType] = useState("bar");
  const { title, data } = section;

  if (!data || data.length === 0) return null;

  return (
    <Box border={1} borderRadius={2} p={2} m={1} width="100%">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6" fontSize={16}>
          {title}
        </Typography>
        <FormControl size="small">
          <InputLabel>Chart</InputLabel>
          <Select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            label="Chart"
          >
            <MenuItem value="bar">Bar</MenuItem>
            <MenuItem value="pie">Pie</MenuItem>
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
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      )}
    </Box>
  );
}
