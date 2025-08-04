const pool = require('../db'); // your PostgreSQL pool

// Recursive function to insert nested categories using the same transaction client
async function insertCategoryRecursive(client, scheme_code, parent_id, category, level = 1) {
  const { category_name, category_name_ll, children = [] } = category;

  const result = await client.query(
    `INSERT INTO m_scheme_category (scheme_code, parent_id, category_name, category_name_ll, level)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING category_id`,
    [scheme_code, parent_id, category_name, category_name_ll, level]
  );

  const newCategoryId = result.rows[0].category_id;

  for (const child of children) {
    await insertCategoryRecursive(client, scheme_code, newCategoryId, child, level + 1);
  }
}

// Controller to insert scheme and its categories
exports.insertSchemeWithCategories = async (req, res) => {
  const { scheme_name, scheme_name_ll, categories } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert into m_scheme; scheme_code is auto-generated
    const result = await client.query(
      `INSERT INTO m_scheme (scheme_name, scheme_name_ll)
       VALUES ($1, $2)
       RETURNING scheme_code`,
      [scheme_name, scheme_name_ll]
    );

    const scheme_code = result.rows[0].scheme_code;

    // Insert nested categories recursively
    for (const category of categories) {
      await insertCategoryRecursive(client, scheme_code, null, category);
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Scheme and categories inserted successfully', scheme_code });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting scheme:', err);
    res.status(500).json({ error: 'Failed to insert scheme and categories' });
  } finally {
    client.release();
  }
};

exports.getSchemeCategoryTree = async (req, res) => {
  const { schemeCode } = req.params;

  try {
    const result = await pool.query(
      `SELECT category_id, parent_id, category_name, category_name_ll
       FROM m_scheme_category
       WHERE scheme_code = $1
       ORDER BY level, sort_order, category_id`,
      [schemeCode]
    );

    const flatList = result.rows;

    const buildTree = (parentId = null) => {
      return flatList
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          category_name: cat.category_name,
          category_name_ll: cat.category_name_ll,
          children: buildTree(cat.category_id)
        }));
    };

    const tree = buildTree();
    res.json(tree);
  } catch (err) {
    console.error('Error fetching category structure:', err);
    res.status(500).json({ error: 'Failed to get scheme structure' });
  }
};

exports.getAllSchemes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT scheme_code, scheme_name, scheme_name_ll FROM m_scheme ORDER BY scheme_code`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching schemes:', err);
    res.status(500).json({ error: 'Failed to fetch scheme list' });
  }
};

// Create table if it doesn't exist
async function ensureSchemeDataTable(scheme_code) {
  const tableName = `t_${scheme_code}_data`;
  const createQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      state_code VARCHAR(2),
      division_code VARCHAR(3),
      district_code VARCHAR(3),
      taluka_code VARCHAR(4),
      year VARCHAR(4),
      month VARCHAR(2),
      data JSONB,
      insert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(createQuery);
}

// Insert scheme data
exports.insertSchemeData = async (req, res) => {
  const {
    scheme_code,
    state_code,
    division_code,
    district_code,
    taluka_code,
    year,
    month,
    data,
  } = req.body;

  const tableName = `t_${scheme_code}_data`;

  try {
    await ensureSchemeDataTable(scheme_code);

    const insertQuery = `
      INSERT INTO ${tableName} (
        state_code, division_code, district_code, taluka_code,
        year, month, data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const values = [
      state_code,
      division_code,
      district_code,
      taluka_code,
      year,
      month,
      data, // this should be a JS object, automatically converted to JSONB
    ];

    const result = await pool.query(insertQuery, values);
    res.status(200).json({ message: 'Data inserted', id: result.rows[0].id });
  } catch (error) {
    console.error('Error inserting scheme data:', error);
    res.status(500).json({ error: 'Failed to insert data' });
  }
};