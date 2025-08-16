const pool = require('../db');
const { mergeDeepSum, mergeDeepSumTime } = require('../utils/jsonMerge');

exports.getDashboardData = async (req, res) => {
  console.log(req.body.params);
  const {
    scheme_code,
    state_code,
    division_code,
    district_code,
    taluka_code,
    year,
    month
  } = req.body.params;

  const tableName = `t_${scheme_code}_data`;

  const conditions = ["is_active = true"]; // Default condition
  const values = [];
  let idx = 1;

  if (state_code) {
    conditions.push(`state_code = $${++idx - 1}`);
    values.push(state_code);
  }
  if (division_code) {
    conditions.push(`division_code = $${++idx - 1}`);
    values.push(division_code);
  }
  if (district_code) {
    conditions.push(`district_code = $${++idx - 1}`);
    values.push(district_code);
  }
  if (taluka_code) {
    conditions.push(`taluka_code = $${++idx - 1}`);
    values.push(taluka_code);
  }
  if (year) {
    conditions.push(`year = $${++idx - 1}`);
    values.push(year);
  }
  if (month) {
    conditions.push(`month = $${++idx - 1}`);
    values.push(month);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const query = `SELECT data FROM ${tableName} ${whereClause}`;
    const result = await pool.query(query, values);

    const rows = result.rows;
    let merged = {};
    rows.forEach(row => mergeDeepSum(merged, row.data));

    res.json(merged);
  } catch (error) {
    console.error('Error in /getDashboardData:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getTimeSeriesData = async (req, res) => {
  const { scheme_code, state_code, division_code, district_code, taluka_code } = req.body.params;

  const tableName = `t_${scheme_code}_data`;
  const filters = ["is_active = true"]; // Default condition
  const values = [];
  let idx = 1;

  if (state_code) {
    filters.push(`state_code = $${++idx - 1}`);
    values.push(state_code);
  }
  if (division_code) {
    filters.push(`division_code = $${++idx - 1}`);
    values.push(division_code);
  }
  if (district_code) {
    filters.push(`district_code = $${++idx - 1}`);
    values.push(district_code);
  }
  if (taluka_code) {
    filters.push(`taluka_code = $${++idx - 1}`);
    values.push(taluka_code);
  }

  const whereClause = `WHERE ${filters.join(' AND ')}`;

  const query = `
    SELECT year, month, data
    FROM ${tableName}
    ${whereClause}
    ORDER BY year, month;
  `;

  try {
    const result = await pool.query(query, values);
    const grouped = {};

    result.rows.forEach(({ year, month, data }) => {
      const key = `${year}-${month}`;
      if (!grouped[key]) {
        grouped[key] = { year, month, data: {} };
      }
      mergeDeepSumTime(grouped[key].data, data);
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("Error in getTimeSeriesData:", error);
    res.status(500).json({ error: "Failed to fetch time series data" });
  }
};
