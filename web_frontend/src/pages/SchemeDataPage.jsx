// SchemeDataPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import {
  fetchSchemeData,
  updateSchemeData,
  fetchSchemes, // ✅ Import added
} from "../services/api";

export default function SchemeDataPage() {
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState({});

  // ✅ Fetch schemes list dynamically
  useEffect(() => {
    const loadSchemes = async () => {
      const res = await fetchSchemes();
      setSchemes(res.data || []);
    };
    loadSchemes();
  }, []);

 // Helper to deeply flatten objects
const flattenObject = (obj, prefix = "") => {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix} - ${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, newKey));
    } else {
      acc[newKey] = value;
    }

    return acc;
  }, {});
};

const loadSchemeData = async (schemeCode) => {
  setLoading(true);
  const res = await fetchSchemeData(schemeCode);

  if (res?.data?.data) {
    const flattened = res.data.data.map((item) => flattenObject(item));
    setRows(flattened);
  } else {
    setRows([]);
  }

  setLoading(false);
};



  const handleSchemeChange = (e) => {
    const code = e.target.value;
    setSelectedScheme(code);
    if (code) loadSchemeData(code);
  };

  const handleEditClick = (row) => {
    setEditRow(row);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    await updateSchemeData(selectedScheme, editRow.id, editRow);
    setRows((prev) => prev.map((r) => (r.id === editRow.id ? editRow : r)));
    setEditOpen(false);
  };

  return (
    <>
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Scheme Data Viewer
      </Typography>

      <Select
        value={selectedScheme}
        onChange={handleSchemeChange}
        displayEmpty
        sx={{ mb: 2, minWidth: 250 }}
      >
        <MenuItem value="">Select a Scheme</MenuItem>
        {schemes.map((scheme) => (
          <MenuItem key={scheme.scheme_code} value={scheme.scheme_code}>
            {scheme.scheme_name}
          </MenuItem>
        ))}
      </Select>

      {loading ? (
  <Typography>Loading...</Typography>
) : (
  selectedScheme && (
    <>
      <Box sx={{ overflowX: "auto", maxWidth: "100%" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {rows.length > 0 &&
                Object.keys(rows[0]).map((key) => (
                  <TableCell
                    key={key}
                    sx={{
                      backgroundColor: "#f5f5f5",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {key}
                  </TableCell>
                ))}
              <TableCell
                sx={{
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                  position: "sticky",
                  right: 0,
                  zIndex: 2,
                  whiteSpace: "nowrap",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <TableRow
                  key={row.id || rowIndex}
                  sx={{
                    backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "#fff",
                  }}
                >
                  {Object.keys(row).map((key) => (
                    <TableCell
                      key={key}
                      sx={{
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {row[key]}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      position: "sticky",
                      right: 0,
                      backgroundColor: "#fff",
                    }}
                  >
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleEditClick(row)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[20]}
      />
    </>
  )
)}


      
    </Box>
    <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
  <DialogTitle>Edit Row</DialogTitle>
  <DialogContent>
    {Object.keys(editRow).map((key) => (
      key !== "id" && (
        <TextField
          key={key}
          label={key}
          fullWidth
          margin="dense"
          value={editRow[key] ?? ""}
          onChange={(e) =>
            setEditRow((prev) => ({ ...prev, [key]: e.target.value }))
          }
        />
      )
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
    <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
  </DialogActions>
</Dialog>
</>

  );
}
