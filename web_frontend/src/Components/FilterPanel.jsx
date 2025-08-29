import React from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
} from "@mui/material";
import { Search } from "@mui/icons-material";

export default function FilterPanel({
  dropdowns,
  isTimeSeries,
  setIsTimeSeries,
  handleSubmit,
  loading,
}) {
  return (
    <Card elevation={4} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, borderRadius: 3 }}>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit?.();
        }}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1.5, sm: 2 },
          alignItems: { xs: "stretch", sm: "center" },
          flexWrap: "wrap",
        }}
      >
        {/* dynamic dropdowns */}
        {dropdowns.map(({ label, value, onChange, options, disabled = false }, idx) => {
          const labelId = `filter-label-${idx}`;
          const selectId = `filter-select-${idx}`;
          return (
            <FormControl
              key={label + idx}
              disabled={disabled}
              fullWidth={true}
              sx={{
                minWidth: { sm: 140 },
                width: { xs: "100%", sm: "auto" },
                flex: { xs: "1 1 100%", sm: "0 0 auto" },
              }}
              size="small"
            >
              <InputLabel id={labelId}>{label}</InputLabel>
              <Select
                labelId={labelId}
                id={selectId}
                value={value ?? ""}
                label={label}
                onChange={(e) => onChange(e.target.value)}
              >
                {options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })}

        {/* view mode select */}
        <FormControl
          fullWidth
          sx={{
            minWidth: { sm: 180 },
            width: { xs: "100%", sm: "auto" },
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
          }}
          size="small"
        >
          <InputLabel id="viewmode-label">View Mode</InputLabel>
          <Select
            labelId="viewmode-label"
            id="viewmode-select"
            value={isTimeSeries ? "time" : "summary"}
            label="View Mode"
            onChange={(e) => setIsTimeSeries(e.target.value === "time")}
          >
            <MenuItem value="summary">Summary View</MenuItem>
            <MenuItem value="time">Time Series View</MenuItem>
          </Select>
        </FormControl>

        {/* action button */}
        <Box
          sx={{
            width: { xs: "100%", sm: "auto" },
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            startIcon={<Search />}
            onClick={handleSubmit}
            disabled={loading}
            fullWidth={true}
            sx={{
              borderRadius: 2,
              px: { xs: 2, sm: 3 },
              py: { xs: 1.1, sm: 0.7 },
              whiteSpace: "nowrap",
            }}
            aria-label="Search"
          >
            {loading ? "Loading..." : "Search"}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
