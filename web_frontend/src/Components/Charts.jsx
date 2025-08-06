// File: src/components/Charts.jsx
import React, { useState,useEffect } from "react";
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
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F",
  "#FFBB28", "#0088FE", "#FF4444", "#7B1FA2", "#3949AB",
  "#E91E63", "#009688"
];

// ✅ Extracts sections from nested JSON for summary mode
const extractChartSections = (obj, parentTitle = "") => {
  const sections = [];

  if (typeof obj !== "object" || obj === null) return sections;

  const chartData = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number") {
      chartData.push({ name: key, value });
    } else if (typeof value === "object" && value !== null) {
      const childKeys = Object.keys(value);
      const allNumbers = childKeys.every(k => typeof value[k] === "number");

      if (allNumbers) {
        sections.unshift({
          title: parentTitle ? `${parentTitle} > ${key}` : key,
          type: "jointBar",
          data: Object.entries(value).map(([k, v]) => ({ name: k, value: v })),
        });
      } else {
        const childSections = extractChartSections(
          value,
          parentTitle ? `${parentTitle} > ${key}` : key
        );
        sections.push(...childSections);
      }
    }
  }

  if (chartData.length > 0) {
    sections.unshift({
      title: parentTitle || "Summary",
      type: "bar",
      data: chartData,
    });
  }

  return sections;
};

// ✅ Transforms array of time series points into chart series
const transformTimeSeries = (raw) => {
  const result = {};

  raw.forEach(({ year, month, data }) => {
    const label = `${month}/${year}`;
    const sections = extractChartSections(data);

    sections.forEach(({ title, data: values, type }) => {
      if (!result[title]) result[title] = { type, data: [] };

      const entry = { label };
      values.forEach(({ name, value }) => {
        entry[name] = value;
      });

      result[title].data.push(entry);
    });
  });

  return result;
};

export default function Charts({ data, timeSeries = false }) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [availableKeys, setAvailableKeys] = useState([]);
useEffect(() => {
  if (!data || typeof data !== "object") return;

  const extractKeys = (obj) => {
    const keys = new Set();
    const walk = (node) => {
      if (typeof node === "object" && node !== null) {
        for (const key in node) {
          if (typeof node[key] === "number") {
            keys.add(key);
          } else {
            walk(node[key]);
          }
        }
      }
    };
    walk(timeSeries ? data[0]?.data || data : data);
    return Array.from(keys);
  };

  setAvailableKeys(extractKeys(data));
}, [data, timeSeries]);


 const filterData = (dataSection) => {
  if (!selectedKeys.length) return dataSection;

  return dataSection.map(entry => {
    const filtered = {};
    if (entry.label) filtered.label = entry.label;
    if (entry.name) filtered.name = entry.name;
    selectedKeys.forEach(k => {
      if (entry[k] !== undefined) filtered[k] = entry[k];
    });
    return filtered;
  });
};


  if (!data || typeof data !== "object") {
    return <Typography>No data available.</Typography>;
  }

  // Handle Time Series Mode
  if (timeSeries) {
    const series = transformTimeSeries(data);

    return (
      <Box>
        <Typography variant="h5" mb={2}>Time Series Charts</Typography>

        {/* Select Parameters */}
        <FormControl fullWidth margin="normal">
  <InputLabel>Chart Parameters</InputLabel>
  <Select
    multiple
    value={selectedKeys}
    onChange={(e) => setSelectedKeys(e.target.value)}
    renderValue={(selected) => selected.join(', ')}
  >
    {availableKeys.map((key) => (
      <MenuItem key={key} value={key}>
        {key}
      </MenuItem>
    ))}
  </Select>
</FormControl>


        <Grid container spacing={2}>
          {Object.entries(series).map(([title, section], idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Box border={1} borderRadius={2} p={2} m={1}>
                <Typography variant="h6" fontSize={16}>{title}</Typography>

                {section.type === "jointBar" ? (
                  <BarChart width={500} height={300} data={filterData(section.data)}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(filterData(section.data)[0] || {})
                      .filter(k => k !== "label")
                      .map((key, i) => (
                        <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                      ))}
                  </BarChart>
                ) : (
                  <LineChart width={500} height={300} data={filterData(section.data)}>
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(filterData(section.data)[0] || {})
                      .filter(k => k !== "label")
                      .map((key, i) => (
                        <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} />
                      ))}
                  </LineChart>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Summary View
 const sections = extractChartSections(data).filter(
  (section) =>
    !selectedKeys.length ||
    section.data.some((d) => selectedKeys.includes(d.name))
);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Dashboard Insights</Typography>

      {/* Select Parameters */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Chart Parameters</InputLabel>
        <Select
          multiple
          value={selectedKeys}
          onChange={(e) => setSelectedKeys(e.target.value)}
          renderValue={(selected) => selected.join(', ')}
        >
          {availableKeys.map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={2}>
        {sections.map((section, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <ChartSection section={{
              ...section,
              data: filterData(section.data)
            }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


// ✅ Summary chart renderer
function ChartSection({ section }) {
  const [chartType, setChartType] = useState(section.type || "bar");
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
            <MenuItem value="jointBar">Joint Bar</MenuItem>
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
    </Box>
  );
}
