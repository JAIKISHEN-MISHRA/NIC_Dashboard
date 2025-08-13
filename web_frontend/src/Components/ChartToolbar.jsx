import React from "react";
import { FormControl, Select, MenuItem, InputLabel } from "@mui/material";

export default function ChartToolbar({ selectedKeys, setSelectedKeys, availableKeys }) {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel>Chart Parameters</InputLabel>
      <Select
        multiple
        value={selectedKeys}
        onChange={(e) => setSelectedKeys(e.target.value)}
        renderValue={(selected) => selected.join(", ")}
      >
        {availableKeys.map((key) => (
          <MenuItem key={key} value={key}>
            {key}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
