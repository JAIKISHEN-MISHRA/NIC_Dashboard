 
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'NIC',
  password: 'Jai@31', 
  port: 5432,
});
app.get('/api/states', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_states();');
    console.log("reached");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});
app.get('/api/divisions/:state_code', async (req, res) => {
  const { state_code } = req.params;
  try {
    const result = await pool.query('SELECT * FROM get_divisions($1);', [state_code]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch divisions' });
  }
});
app.get('/api/districts', async (req, res) => {
  const { state_code, division_code } = req.query;
  try {
    const result = await pool.query('SELECT * FROM get_districts($1, $2);', [state_code, division_code]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});
app.get('/api/talukas', async (req, res) => {
  const { state_code, division_code, district_code } = req.query;
  try {
    const result = await pool.query('SELECT * FROM get_talukas($1, $2, $3);', [
      state_code, division_code, district_code,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch talukas' });
  }
});


app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
