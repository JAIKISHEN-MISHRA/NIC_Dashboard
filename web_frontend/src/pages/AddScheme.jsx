import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  fetchSchemes,
  fetchSchemeStructure,
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  createScheme
} from '../services/api';

const AddSchemeForm = () => {
  const [scheme, setScheme] = useState({ name: '', name_ll: '' });
  const [categories, setCategories] = useState([]);
  const [existingSchemes, setExistingSchemes] = useState([]);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [schemeStructure, setSchemeStructure] = useState([]);

  // location selects
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [selectedState, setSelectedState] = useState(''); // required
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [fetchedLocation, setFetchedLocation] = useState(null);


  const [submitting, setSubmitting] = useState(false);
  const [notif, setNotif] = useState({ open: false, severity: 'success', message: '' });

  // load schemes + states on mount
  useEffect(() => {
    (async () => {
      await loadSchemes();
      await loadStates();
    })();
  }, []);

  const loadSchemes = async () => {
    try {
      const { data, error } = await fetchSchemes();
      if (data) setExistingSchemes(data);
      else console.error('Failed to load schemes', error);
    } catch (err) {
      console.error('Error loading schemes', err);
    }
  };

  const loadStates = async () => {
    setLoadingStates(true);
    try {
      const res = await getStates();
      // assume getStates returns an array (or {data})
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setStates(list);
    } catch (err) {
      console.error('Failed to load states', err);
    } finally {
      setLoadingStates(false);
    }
  };

  const handleStateChange = async (value) => {
    setSelectedState(value);
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedTaluka('');
    setDivisions([]);
    setDistricts([]);
    setTalukas([]);

    if (!value) return;

    setLoadingDivisions(true);
    try {
      const res = await getDivisions(value); // expects state_code
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setDivisions(list);
    } catch (err) {
      console.error('Failed to load divisions', err);
    } finally {
      setLoadingDivisions(false);
    }
  };

  const handleDivisionChange = async (value) => {
    setSelectedDivision(value);
    setSelectedDistrict('');
    setSelectedTaluka('');
    setDistricts([]);
    setTalukas([]);

    if (!value) return;

    setLoadingDistricts(true);
    try {
      // getDistricts(state_code, division_code)
      const res = await getDistricts(selectedState, value);
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setDistricts(list);
    } catch (err) {
      console.error('Failed to load districts', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (value) => {
    setSelectedDistrict(value);
    setSelectedTaluka('');
    setTalukas([]);

    if (!value) return;

    setLoadingTalukas(true);
    try {
      // getTalukas(state_code, division_code, district_code)
      const res = await getTalukas(selectedState, selectedDivision, value);
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setTalukas(list);
    } catch (err) {
      console.error('Failed to load talukas', err);
    } finally {
      setLoadingTalukas(false);
    }
  };

  const handleTalukaChange = (value) => {
    setSelectedTaluka(value);
  };

const handleFetchStructure = async (schemeCode) => {
  const { data, error } = await fetchSchemeStructure(schemeCode);
  if (data) {
    // API returns { data: <tree>, location: <obj|null> }
    setSchemeStructure(data.data);
    setFetchedLocation(data.location ?? null); // save location for reuse
    setExpandedScheme(schemeCode);
    console.log(data);
  } else {
    console.error('Failed to load scheme structure', error);
    setNotif({ open: true, severity: 'error', message: 'Failed to load structure' });
  }
};


  const handleSchemeChange = (e) => {
    setScheme({ ...scheme, [e.target.name]: e.target.value });
  };

  const addCategory = (parentId = null) => {
    const newCategory = {
      id: Date.now() + Math.random(),
      parentId,
      name: '',
      name_ll: '',
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleCategoryChange = (id, field, value) => {
    setCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, [field]: value } : cat))
    );
  };

  const removeCategory = (id) => {
    const removeRecursively = (targetId) => {
      const children = categories.filter(cat => cat.parentId === targetId);
      return [targetId, ...children.flatMap(child => removeRecursively(child.id))];
    };
    const idsToRemove = removeRecursively(id);
    setCategories(prev => prev.filter(cat => !idsToRemove.includes(cat.id)));
  };

  const renderNestedCategories = (parentId = null, level = 1) => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => (
        <div key={cat.id} style={{ marginLeft: `${level * 18}px`, marginTop: 10 }}>
          <Card variant="outlined">
            <CardContent className="d-flex align-items-center gap-2">
              <TextField
                label="Category Name"
                size="small"
                value={cat.name}
                onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                style={{ minWidth: 220 }}
              />
              <TextField
                label="Category Name (LL)"
                size="small"
                value={cat.name_ll}
                onChange={(e) => handleCategoryChange(cat.id, 'name_ll', e.target.value)}
                style={{ minWidth: 220 }}
              />
              <IconButton color="primary" onClick={() => addCategory(cat.id)} title="Add child">
                <Add />
              </IconButton>
              <IconButton color="error" onClick={() => removeCategory(cat.id)} title="Remove">
                <Delete />
              </IconButton>
            </CardContent>
          </Card>
          {renderNestedCategories(cat.id, level + 1)}
        </div>
      ));
  };

  const buildCategoryTree = (flatList, parentId = null) => {
    return flatList
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        category_name: cat.name,
        category_name_ll: cat.name_ll,
        children: buildCategoryTree(flatList, cat.id),
      }));
  };

  const handleSubmit = async () => {
  if (!scheme.name?.trim()) {
    return setNotif({ open: true, severity: 'warning', message: 'Scheme name is required' });
  }
  if (!selectedState) {
    return setNotif({ open: true, severity: 'warning', message: 'State is required' });
  }

  const nestedCategories = buildCategoryTree(categories);
  const payload = {
    scheme_name: scheme.name,
    scheme_name_ll: scheme.name_ll,
    state_code: selectedState,
    division_code: selectedDivision || null,
    district_code: selectedDistrict || null,
    taluka_code: selectedTaluka || null,
    categories: nestedCategories,
  };

  try {
    setSubmitting(true);
    const { data: createResp, error: createErr } = await createScheme(payload);

    if (createErr) {
      console.error('Error creating scheme:', createErr);
      setNotif({ open: true, severity: 'error', message: 'Submission failed' });
      return;
    }

    setNotif({ open: true, severity: 'success', message: 'Scheme submitted successfully' });
    setScheme({ name: '', name_ll: '' });
    setCategories([]);
    setSelectedState('');
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedTaluka('');
    await loadSchemes(); // refresh list
  } catch (error) {
    console.error('Error submitting scheme:', error);
    setNotif({ open: true, severity: 'error', message: 'Submission failed' });
  } finally {
    setSubmitting(false);
  }
};


  const buildStructuredRows = (nodes, level = 0, rows = []) => {
    if (!rows[level]) rows[level] = [];

    for (let node of nodes) {
      const childRowSpan = buildStructuredRows(node.children || [], level + 1, rows);

      rows[level].push({
        node,
        colSpan: Math.max(childRowSpan, 1),
      });
    }

    return nodes.reduce((acc, node) => {
      const childCount = (node.children && node.children.length > 0)
        ? buildStructuredRows(node.children, level + 1, []) // Dummy call to count cols
        : 1;
      return acc + Math.max(childCount, 1);
    }, 0);
  };

  const renderCategoryTableRows = (treeData) => {
    if (!treeData || treeData.length === 0) {
      return (
        <TableRow>
          <TableCell align="center">No categories</TableCell>
        </TableRow>
      );
    }
    const rows = [];
    buildStructuredRows(treeData, 0, rows);

    return rows.map((row, rowIdx) => (
      <TableRow key={rowIdx}>
        {row.map(({ node, colSpan }, colIdx) => (
          <TableCell
            key={`${rowIdx}-${colIdx}`}
            align="center"
            colSpan={colSpan}
            style={{
              border: '1px solid #eee',
              backgroundColor: '#fafafa',
              fontWeight: 500,
              verticalAlign: 'middle',
              padding: '10px 8px',
            }}
          >
            <div>{node.category_name || <em style={{ color: '#777' }}>—</em>}</div>
            <div style={{ fontSize: '0.8rem', color: '#777' }}>{node.category_name_ll}</div>
          </TableCell>
        ))}
      </TableRow>
    ));
  };

 const handleEditScheme = async (schemeCode) => {
  const confirmEdit = window.confirm("Are you sure you want to edit this scheme?");
  if (!confirmEdit) return;

  try {
    // Use already-loaded structure/location when possible
    let tree = schemeStructure;
    let location = fetchedLocation;

    // Fallback: if structure isn't loaded or user didn't expand it yet, fetch once
    if (!tree || expandedScheme !== schemeCode) {
      const resp = await fetchSchemeStructure(schemeCode);
      if (!resp?.data) {
        setNotif({ open: true, severity: 'error', message: 'Failed to load scheme for editing' });
        return;
      }
      tree = resp.data.data;
      location = resp.data.location ?? null;
      // persist so future operations reuse it
      setSchemeStructure(tree);
      setFetchedLocation(location);
      setExpandedScheme(schemeCode);
    }

    // Fill scheme basic details (keep previous behavior)
    const schemeData = existingSchemes.find(s => s.scheme_code === schemeCode);
    if (schemeData) {
      setScheme({ name: schemeData.scheme_name, name_ll: schemeData.scheme_name_ll || '' });
    }

    // Flatten categories for the form
    const flattenTree = (nodes, parentId = null) => {
      return (nodes || []).flatMap(node => {
        const newId = Date.now() + Math.random();
        const current = {
          id: newId,
          parentId,
          name: node.category_name || '',
          name_ll: node.category_name_ll || ''
        };
        const children = flattenTree(node.children || [], newId);
        return [current, ...children];
      });
    };

    setCategories(flattenTree(tree));

    // If location exists, cascade-fill selects using your service calls
    if (location) {
      // STATE
      if (location.state_code) {
        setSelectedState(location.state_code);

        try {
          const resDiv = await getDivisions(location.state_code);
          const divList = Array.isArray(resDiv) ? resDiv : (resDiv?.data ?? []);
          setDivisions(divList);

          // DIVISION
          if (location.division_code) {
            setSelectedDivision(location.division_code);

            const resDist = await getDistricts(location.state_code, location.division_code);
            const distList = Array.isArray(resDist) ? resDist : (resDist?.data ?? []);
            setDistricts(distList);

            // DISTRICT
            if (location.district_code) {
              setSelectedDistrict(location.district_code);

              const resTal = await getTalukas(location.state_code, location.division_code, location.district_code);
              const talList = Array.isArray(resTal) ? resTal : (resTal?.data ?? []);
              setTalukas(talList);

              // TALUKA
              if (location.taluka_code) {
                setSelectedTaluka(location.taluka_code);
              }
            }
          }
        } catch (locErr) {
          console.error('Failed to populate location selects for edit:', locErr);
          setNotif({ open: true, severity: 'warning', message: 'Loaded scheme but failed to populate some location selects' });
        }
      }
    }

    setNotif({ open: true, severity: 'info', message: 'Scheme loaded for editing' });
  } catch (err) {
    console.error(err);
    setNotif({ open: true, severity: 'error', message: 'Error loading scheme for editing' });
  }
};



  return (
    <Box className="container mt-4">
      <Typography variant="h5" gutterBottom>Add New Scheme</Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                required
                label="Scheme Name"
                name="name"
                value={scheme.name}
                onChange={handleSchemeChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Scheme Name (LL)"
                name="name_ll"
                value={scheme.name_ll}
                onChange={handleSchemeChange}
              />
            </Grid>

            <Grid item xs={12} md={3} className="d-flex align-items-center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => addCategory(null)}
                startIcon={<Add />}
              >
                Add Root Category
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={() => { setCategories([]); setNotif({ open: true, severity: 'info', message: 'Categories cleared' }); }}
              >
                Clear Categories
              </Button>
            </Grid>

            {/* Location dropdowns */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth required>
                <InputLabel id="state-label">State *</InputLabel>
                <Select
                  labelId="state-label"
                  label="State *"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  {loadingStates ? (
                    <MenuItem value="">
                      <em><CircularProgress size={18} /></em>
                    </MenuItem>
                  ) : (
                    states.map(s => (
                      <MenuItem key={s.state_code ?? s.code ?? s.value ?? s.id} value={s.state_code ?? s.code ?? s.value ?? s.id}>
                        {s.state_name ?? s.name ?? s.label}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="division-label">Division</InputLabel>
                <Select
                  labelId="division-label"
                  label="Division"
                  value={selectedDivision}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  disabled={!selectedState || loadingDivisions}
                >
                  {loadingDivisions ? (
                    <MenuItem value=""><em><CircularProgress size={18} /></em></MenuItem>
                  ) : (
                    divisions.length ? divisions.map(d => (
                      <MenuItem key={d.division_code ?? d.code ?? d.id} value={d.division_code ?? d.code ?? d.id}>
                        {d.division_name ?? d.name ?? d.label}
                      </MenuItem>
                    )) : <MenuItem value=""><em>No divisions</em></MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="district-label">District</InputLabel>
                <Select
                  labelId="district-label"
                  label="District"
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={!selectedDivision || loadingDistricts}
                >
                  {loadingDistricts ? (
                    <MenuItem value=""><em><CircularProgress size={18} /></em></MenuItem>
                  ) : (
                    districts.length ? districts.map(d => (
                      <MenuItem key={d.district_code ?? d.code ?? d.id} value={d.district_code ?? d.code ?? d.id}>
                        {d.district_name ?? d.name ?? d.label}
                      </MenuItem>
                    )) : <MenuItem value=""><em>No districts</em></MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="taluka-label">Taluka</InputLabel>
                <Select
                  labelId="taluka-label"
                  label="Taluka"
                  value={selectedTaluka}
                  onChange={(e) => handleTalukaChange(e.target.value)}
                  disabled={!selectedDistrict || loadingTalukas}
                >
                  {loadingTalukas ? (
                    <MenuItem value=""><em><CircularProgress size={18} /></em></MenuItem>
                  ) : (
                    talukas.length ? talukas.map(t => (
                      <MenuItem key={t.taluka_code ?? t.code ?? t.id} value={t.taluka_code ?? t.code ?? t.id}>
                        {t.taluka_name ?? t.name ?? t.label}
                      </MenuItem>
                    )) : <MenuItem value=""><em>No talukas</em></MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* categories editor */}
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>Categories</Typography>
            {renderNestedCategories()}
            {categories.length === 0 && (
              <Typography variant="body2" color="textSecondary">No categories yet. Use "Add Root Category" to begin.</Typography>
            )}
          </Box>

          <Stack direction="row" spacing={2} mt={3}>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><CircularProgress size={18} sx={{ mr: 1 }} />Submitting</> : 'Submit Scheme'}
            </Button>
            <Button variant="outlined" onClick={() => {
              setScheme({ name: '', name_ll: '' });
              setCategories([]);
              setSelectedState('');
              setSelectedDivision('');
              setSelectedDistrict('');
              setSelectedTaluka('');
            }}>
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box mt={4}>
        <Typography variant="h6">Existing Schemes</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
          {existingSchemes.length === 0 && <Typography color="textSecondary">No schemes found.</Typography>}
          {existingSchemes.map(s => (
            <Box key={s.scheme_code}>
              <Button
                variant={expandedScheme === s.scheme_code ? 'contained' : 'outlined'}
                onClick={() => handleFetchStructure(s.scheme_code)}
                sx={{ textTransform: 'none' }}
              >
                {s.scheme_name} <span style={{ marginLeft: 6, color: '#999' }}>({s.scheme_code})</span>
              </Button>
            </Box>
          ))}
        </Box>

        {expandedScheme && schemeStructure && (
  <>
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table size="small">
        <TableBody>
          {renderCategoryTableRows(schemeStructure)}
        </TableBody>
      </Table>
    </TableContainer>

    <Box mt={2}>
      <Button
        variant="contained"
        color="warning"
        onClick={() => handleEditScheme(expandedScheme)}
      >
        Edit Scheme
      </Button>
    </Box>
  </>
)}

      </Box>

      <Snackbar
        open={notif.open}
        autoHideDuration={3500}
        onClose={() => setNotif(n => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setNotif(n => ({ ...n, open: false }))} severity={notif.severity} sx={{ width: '100%' }}>
          {notif.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddSchemeForm;
