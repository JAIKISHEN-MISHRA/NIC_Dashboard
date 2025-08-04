import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  TableContainer,
  Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { fetchSchemes ,fetchSchemeStructure} from '../services/api';

const AddSchemeForm = () => {
  const [scheme, setScheme] = useState({ name: '', name_ll: '' });
  const [categories, setCategories] = useState([]);
  const [existingSchemes, setExistingSchemes] = useState([]);
  const [expandedScheme, setExpandedScheme] = useState(null);
  const [schemeStructure, setSchemeStructure] = useState([]);

  useEffect(() => {
  const loadSchemes = async () => {
    const { data, error } = await fetchSchemes();
    if (data) setExistingSchemes(data);
    else console.error('Failed to load schemes');
  };

  loadSchemes();
}, []);
 

  const handleFetchStructure = async (schemeCode) => {
  const { data, error } = await fetchSchemeStructure(schemeCode);
  if (data) {
    setSchemeStructure(data);
    setExpandedScheme(schemeCode);
  } else {
    console.error("Failed to load scheme structure");
  }
};

  const handleSchemeChange = (e) => {
    setScheme({ ...scheme, [e.target.name]: e.target.value });
  };

  const addCategory = (parentId = null) => {
    const newCategory = {
      id: Date.now(),
      parentId,
      name: '',
      name_ll: '',
    };
    setCategories([...categories, newCategory]);
  };

  const handleCategoryChange = (id, field, value) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const removeCategory = (id) => {
    const removeRecursively = (targetId) => {
      const children = categories.filter(cat => cat.parentId === targetId);
      return [targetId, ...children.flatMap(child => removeRecursively(child.id))];
    };
    const idsToRemove = removeRecursively(id);
    setCategories(categories.filter(cat => !idsToRemove.includes(cat.id)));
  };

  const renderNestedCategories = (parentId = null, level = 1) => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => (
        <div key={cat.id} style={{ marginLeft: `${level * 20}px`, marginTop: 10 }}>
          <Card>
            <CardContent className="d-flex align-items-center gap-2">
              <TextField
                label="Category Name"
                size="small"
                value={cat.name}
                onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
              />
              <TextField
                label="Category Name (LL)"
                size="small"
                value={cat.name_ll}
                onChange={(e) => handleCategoryChange(cat.id, 'name_ll', e.target.value)}
              />
              <IconButton onClick={() => addCategory(cat.id)}>
                <Add />
              </IconButton>
              <IconButton onClick={() => removeCategory(cat.id)}>
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
    if (!scheme.name) return alert('Scheme name is required');

    const nestedCategories = buildCategoryTree(categories);
    const payload = {
      scheme_name: scheme.name,
      scheme_name_ll: scheme.name_ll,
      categories: nestedCategories,
    };

    try {
      await axios.post('http://localhost:5000/api/scheme', payload);
      alert('Scheme submitted successfully');
      setScheme({ name: '', name_ll: '' });
      setCategories([]);
      fetchSchemes();
    } catch (error) {
      console.error('Error submitting scheme:', error);
      alert('Submission failed');
    }
  };

 // Compute table structure with optimized columns (only where needed)
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
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            fontWeight: 'bold',
            verticalAlign: 'middle',
            padding: '12px 8px',
          }}
        >
          <div>{node.category_name}</div>
          <div style={{ fontSize: '0.8rem', color: '#777' }}>{node.category_name_ll}</div>
        </TableCell>
      ))}
    </TableRow>
  ));
};





  return (
    <div className="container mt-4">
      <Typography variant="h5" gutterBottom>Add New Scheme</Typography>

      <div className="row mb-3">
        <div className="col-md-4">
          <TextField
            fullWidth
            label="Scheme Name"
            name="name"
            value={scheme.name}
            onChange={handleSchemeChange}
          />
        </div>
        <div className="col-md-4">
          <TextField
            fullWidth
            label="Scheme Name (LL)"
            name="name_ll"
            value={scheme.name_ll}
            onChange={handleSchemeChange}
          />
        </div>
        <div className="col-md-4 d-flex align-items-center">
          <Button variant="contained" onClick={() => addCategory(null)}>
            Add Root Category
          </Button>
        </div>
      </div>

      {renderNestedCategories()}

      <Button variant="contained" color="primary" onClick={handleSubmit} className="mt-3">
        Submit Scheme
      </Button>

      <div className="mt-5">
        <Typography variant="h6">Existing Schemes</Typography>
        {existingSchemes.map(s => (
          <div key={s.scheme_code}>
            <Button
              variant="outlined"
              onClick={() => handleFetchStructure(s.scheme_code)}
              className="my-1"
            >
              {s.scheme_name} ({s.scheme_code})
            </Button>

           {expandedScheme === s.scheme_code && (
  <TableContainer component={Paper} style={{ marginTop: 10 }}>
    <Table size="small">
      <TableBody>
        {renderCategoryTableRows(schemeStructure)}
      </TableBody>
    </Table>
  </TableContainer>
)}


          </div>
        ))}
      </div>
    </div>
  );
};

export default AddSchemeForm;
