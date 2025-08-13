import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { COLORS } from "./chartUtils";

export default function TimeSeriesCharts({ series, filterData }) {
  return (
    <Grid container spacing={2}>
      {Object.entries(series).map(([title, section], idx) => {
        const safeData = filterData(section.data);
        if (!safeData.length) return null;

        const keys = Object.keys(safeData[0] || {}).filter(k => k !== "label");

        return (
          <Grid item xs={12} md={6} key={idx}>
            <Box border={1} borderRadius={2} p={2} m={1}>
              <Typography variant="h6" fontSize={16}>{title}</Typography>
              {section.type === "jointBar" ? (
                <BarChart width={500} height={300} data={safeData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {keys.map((key, i) => (
                    <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                  ))}
                </BarChart>
              ) : (
                <LineChart width={500} height={300} data={safeData}>
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {keys.map((key, i) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} />
                  ))}
                </LineChart>
              )}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
}
