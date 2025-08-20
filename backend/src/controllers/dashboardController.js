const pool = require('../db');
const { mergeDeepSum, mergeDeepSumTime } = require('../utils/jsonMerge');

exports.getDashboardData = async (req, res) => {
  const { scheme_code, periods, ...locationParams } = req.body.params;

  // 1. Basic security validation for scheme_code to prevent SQL injection
  if (!/^[a-zA-Z0-9_]+$/.test(scheme_code)) {
    return res.status(400).json({ error: 'Invalid scheme code format' });
  }
  const tableName = `t_${scheme_code}_data`;

  // 2. Use the helper function to build location filters
  const { conditions, values } = buildBaseClause(locationParams);

  // 3. CRITICAL FIX: Add filtering for 'periods' (e.g., ['2025-08'])
  if (periods && periods.length > 0) {
    // This assumes you have a 'period' column with format 'YYYY-MM' for monthly,
    // 'YYYY' for yearly, etc. Adjust the column name ('period') if it's different.
    const periodPlaceholders = periods.map((_, i) => `$${values.length + i + 1}`).join(',');
    conditions.push(`period IN (${periodPlaceholders})`);
    values.push(...periods);
  }

  // Fallback to year/month if periods is empty but year/month are present
  else if (locationParams.year && locationParams.month) {
     conditions.push(`year = $${values.length + 1}`);
     values.push(locationParams.year);
     conditions.push(`month = $${values.length + 1}`);
     values.push(locationParams.month);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  try {
    const query = `SELECT data FROM ${tableName} ${whereClause}`;
    const result = await pool.query(query, values);

    const merged = {};
    result.rows.forEach(row => mergeDeepSum(merged, row.data));

    res.json(merged);
  } catch (error) {
    console.error('Error in /getDashboardData:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};


exports.getTimeSeriesData = async (req, res) => {
  const { scheme_code, periods, ...locationParams } = req.body.params;

  // 1. Basic security validation
  if (!/^[a-zA-Z0-9_]+$/.test(scheme_code)) {
    return res.status(400).json({ error: 'Invalid scheme code format' });
  }
  const tableName = `t_${scheme_code}_data`;

  // 2. Use the helper function
  const { conditions, values } = buildBaseClause(locationParams);
  
  // 3. Add optional period filtering for time series
  if (periods && periods.length > 0) {
    const periodPlaceholders = periods.map((_, i) => `$${values.length + i + 1}`).join(',');
    conditions.push(`period IN (${periodPlaceholders})`);
    values.push(...periods);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

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



const buildBaseClause = (params) => {
  const { state_code, division_code, district_code, taluka_code } = params;
  const conditions = ["is_active = true"];
  const values = [];

  const addCondition = (field, value) => {
    if (value) {
      conditions.push(`${field} = $${values.length + 1}`);
      values.push(value);
    }
  };

  addCondition('state_code', state_code);
  addCondition('division_code', division_code);
  addCondition('district_code', district_code);
  addCondition('taluka_code', taluka_code);

  return { conditions, values };
};