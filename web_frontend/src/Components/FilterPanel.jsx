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

export default function FilterPanel({ dropdowns, isTimeSeries, setIsTimeSeries, handleSubmit, loading }) {
  return (
    <Card elevation={4} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        {dropdowns.map(({ label, value, onChange, options, disabled = false }) => (
          <FormControl key={label} disabled={disabled} sx={{ minWidth: 140 }}>
            <InputLabel>{label}</InputLabel>
            <Select value={value} onChange={(e) => onChange(e.target.value)}>
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}

        {/* View Mode */}
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>View Mode</InputLabel>
          <Select
            value={isTimeSeries ? "time" : "summary"}
            onChange={(e) => {
              setIsTimeSeries(e.target.value === "time");
            }}
          >
            <MenuItem value="summary">Summary View</MenuItem>
            <MenuItem value="time">Time Series View</MenuItem>
          </Select>
        </FormControl>

        {/* Action Button */}
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSubmit}
          disabled={loading}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {loading ? "Loading..." : ""}
        </Button>
      </Box>
    </Card>
  );
}
