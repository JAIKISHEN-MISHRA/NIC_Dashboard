import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import ChartToolbar from "./ChartToolbar";
import ChartSection from "./ChartSection";
import TimeSeriesCharts from "./TimeSeriesCharts";
import { extractChartSections, transformTimeSeries } from "./chartUtils";

export default function Charts({ data, timeSeries = false }) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [availableKeys, setAvailableKeys] = useState([]);

  useEffect(() => {
    if (!data || typeof data !== "object") return;

    let keys = new Set();

    if (timeSeries) {
      const series = transformTimeSeries(data);
      for (const section of Object.values(series)) {
        section.data.forEach((entry) => {
          Object.keys(entry).forEach((k) => {
            if (k !== "label" && k !== "name") keys.add(k);
          });
        });
      }
    } else {
      const walk = (node) => {
        if (node && typeof node === "object") {
          for (const [key, value] of Object.entries(node)) {
            if (typeof value === "number") {
              keys.add(key);
            } else if (typeof value === "object" && value !== null) {
              walk(value);
            }
          }
        }
      };
      walk(data);
    }

    setAvailableKeys(Array.from(keys));
  }, [data, timeSeries]);

  const filterData = (sectionData) => {
    if (!selectedKeys.length) return sectionData;
    return sectionData.map((entry) => {
      const filtered = {};
      if (entry.label) filtered.label = entry.label;
      if (entry.name) filtered.name = entry.name;
      selectedKeys.forEach((k) => {
        if (entry[k] !== undefined) filtered[k] = entry[k];
      });
      return filtered;
    });
  };

  if (!data || typeof data !== "object") {
    return <Typography>No data available.</Typography>;
  }

  const hasValidData = (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return false;
    return dataArray.some((entry) =>
      Object.values(entry).some(
        (val) => typeof val === "number" && val !== 0 && !isNaN(val)
      )
    );
  };

  if (timeSeries) {
    const series = transformTimeSeries(data);

    const filteredSeriesEntries = Object.entries(series).filter(
      ([, section]) => hasValidData(filterData(section.data))
    );

    if (filteredSeriesEntries.length === 0) {
      return <Typography>No data available for selected parameters.</Typography>;
    }

    const filteredSeries = Object.fromEntries(filteredSeriesEntries);

    return (
      <Box>
        <Typography variant="h5" mb={2}>
          Time Series Charts
        </Typography>

        {/* Show toolbar ONLY in time series mode */}
        <ChartToolbar
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          availableKeys={availableKeys}
        />

        <TimeSeriesCharts series={filteredSeries} filterData={filterData} />
      </Box>
    );
  }

  // Summary mode (NO toolbar here)
  const allSections = extractChartSections(data).filter(
    (section) =>
      !selectedKeys.length ||
      section.data.some((d) => selectedKeys.includes(d.name))
  );

  const filteredSections = allSections.filter((section) =>
    hasValidData(filterData(section.data))
  );

  if (filteredSections.length === 0) {
    return <Typography>No data available for selected parameters.</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Dashboard Insights
      </Typography>

      {/* NO ChartToolbar here in summary */}

      <Grid container spacing={2}>
        {filteredSections.map((section, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <ChartSection section={{ ...section, data: filterData(section.data) }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
