// src/Components/Charts.js
import React, { useMemo } from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SummaryCard from './SummaryCard';
import SmartChart from './SmartChart';
import {
  calculateGrandTotal,
  calculateSummaries,
  extractChartSections,
  transformTimeSeriesData,
  COLORS,
} from './chartUtils';

export default function Charts({ data, isTimeSeries }) {
  // Use useMemo to prevent recalculating on every render
  const chartData = useMemo(() => {
    if (!data) return null;

    if (isTimeSeries) {
      return { timeSeries: transformTimeSeriesData(data) };
    } else {
      const grandTotal = calculateGrandTotal(data);
      const summaries = calculateSummaries(data, grandTotal);
      const sections = extractChartSections(data);
      return { summaries, sections };
    }
  }, [data, isTimeSeries]);

  if (!chartData) {
    // This can be replaced with a more elegant "No Data" component
    return <Typography>No data available to display charts.</Typography>;
  }

  // --- RENDER TIME SERIES VIEW ---
  if (isTimeSeries) {
    const { data: tsData, keys } = chartData.timeSeries;
    if (tsData.length === 0) return <Typography>No time series data points found.</Typography>;

    return (
      <Box p={2}>
        <Typography variant="h5" gutterBottom>Time Series Analysis</Typography>
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={tsData}>
              <XAxis dataKey="label" tick={{ fontSize: 12 }} angle={-20} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Legend />
              {keys.map((key, i) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  }

  // --- RENDER DASHBOARD VIEW ---
  const { summaries, sections } = chartData;
  return (
    <Box>
      {/* 1. Summary Cards Section */}
      <Grid container spacing={3} mb={4}>
        {summaries.map((summary, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <SummaryCard title={summary.title} value={summary.value} />
          </Grid>
        ))}
      </Grid>

      {/* 2. Dynamic Charts Section */}
      <Grid container spacing={3}>
        {sections.map((section, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <SmartChart section={section} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}