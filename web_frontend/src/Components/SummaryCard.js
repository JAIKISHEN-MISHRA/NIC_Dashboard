// src/Components/charts/SummaryCard.js
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

export default function SummaryCard({ title, value }) {
  // Format numbers for better readability
  const formattedValue = Number.isInteger(value)
    ? value.toLocaleString()
    : value.toFixed(2);

  return (
    <Card sx={{ height: '100%', borderLeft: '4px solid', borderColor: 'primary.main' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold">
          {formattedValue}
        </Typography>
      </CardContent>
    </Card>
  );
}