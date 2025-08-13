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

// Aradhana
exports.getAllSchemes2 = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM t_sch004_data`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching schemes:', err);
    res.status(500).json({ error: 'Failed to fetch scheme list' });
  }
};
// 

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
    user_code,
    user_division_code,
    user_level_code,
    role_code,
    division_code,
    scheme_code,
    state_code,
    district_code,
    taluka_code,
    year,
    month,
    data,
  } = req.body;

  try {
    // 1️⃣ Validate login data
    if (!user_code || !user_level_code || !division_code) {
      return res.status(401).json({ error: "Please login to upload" });
    }

    // 2️⃣ If user_level_code = DT but role_code = VW → reject
    if (user_level_code === "DT" && role_code === "VW") {
      return res.status(403).json({ error: "You have viewing rights, not upload rights" });
    }

    // 3️⃣ If user_level_code = DT and role_code = AD → Approval table
    if (user_level_code === "DT" && role_code === "AD") {
      const approvalQuery = `
        INSERT INTO Approval (
          user_code, user_division_code, user_level_code, role_code,
          division_code, scheme_code, state_code, district_code, taluka_code,
          year, month, data, approved_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NULL)
        RETURNING id
      `;

      const approvalValues = [
        user_code,
        user_division_code,
        user_level_code,
        role_code,
        division_code,
        scheme_code,
        state_code,
        district_code,
        taluka_code,
        year,
        month,
        data
      ];

      const result = await pool.query(approvalQuery, approvalValues);
      return res.status(200).json({
        message: "Data staged for approval",
        approval_id: result.rows[0].id
      });
    }

    // 4️⃣ Default → Direct insert into scheme-specific table
    const tableName = `t_${scheme_code}_data`;
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
      data
    ];

    const result = await pool.query(insertQuery, values);
    res.status(200).json({
      message: "Data inserted",
      id: result.rows[0].id
    });

  } catch (error) {
    console.error("Error inserting scheme data:", error);
    res.status(500).json({ error: "Failed to insert data" });
  }
};


exports.getPendingApprovals = async (req, res) => {
  const { schemeCode } = req.params;

  try {
    const query = `
      SELECT *
      FROM approval
      WHERE scheme_code = $1
        AND approved_by IS NULL
      ORDER BY id DESC
    `;
    const { rows } = await pool.query(query, [schemeCode]);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error("Error fetching pending approvals:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch approval data"
    });
  }
};

// Approve data
exports.approveData = async (req, res) => {
  const { id } = req.params;
  try {
    // 1️⃣ Get the approval record
    const { rows } = await pool.query(
      `SELECT * FROM Approval WHERE id=$1 AND status='Pending'`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Approval request not found" });
    }

    const row = rows[0];
    const tableName = `t_${row.scheme_code}_data`;

    // 2️⃣ Ensure scheme-specific table exists
    await ensureSchemeDataTable(row.scheme_code);

    // 3️⃣ Insert into scheme table
    await pool.query(
      `INSERT INTO ${tableName} (
        state_code, division_code, district_code, taluka_code,
        year, month, data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        row.state_code,
        row.division_code,
        row.district_code,
        row.taluka_code,
        row.year,
        row.month,
        row.data
      ]
    );

    // 4️⃣ Update approval status
    await pool.query(
      `UPDATE Approval SET status='Approved', approved_by=$1, approved_at=NOW() WHERE id=$2`,
      [req.user?.user_code || null, id] // If you have user auth
    );

    res.json({ message: "Approved successfully" });
  } catch (err) {
    console.error("Error approving data:", err);
    res.status(500).json({ error: "Approval failed" });
  }
};

// Reject data
exports.rejectData = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  if (!remark?.trim()) {
    return res.status(400).json({ error: "Rejection remark is required" });
  }
  try {
    await pool.query(
      `UPDATE Approval 
       SET status='Rejected', rejection_remark=$1, rejected_by=$2, rejected_at=NOW() 
       WHERE id=$3`,
      [remark, req.user?.user_code || null, id] // If you have user auth
    );
    res.json({ message: "Rejected successfully" });
  } catch (err) {
    console.error("Error rejecting data:", err);
    res.status(500).json({ error: "Rejection failed" });
  }
};



// Helper to safely get table name
function getSchemeTableName(schemeCode) {
  // Ensure it only contains letters, numbers, underscores
  if (!/^[a-zA-Z0-9_]+$/.test(schemeCode)) {
    throw new Error("Invalid scheme code");
  }
  return `t_${schemeCode}_data`;
}

// ✅ Fetch paginated scheme data
exports.getSchemeData = async (req, res) => {
  const { schemeCode } = req.params;
  const { page = 1 } = req.query;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const tableName = getSchemeTableName(schemeCode);

    const dataQuery = `
      SELECT * 
      FROM ${tableName}
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM ${tableName}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [limit, offset]),
      pool.query(countQuery),
    ]);

    // ✅ Remove the insert_date column from each row before sending
    const cleanedRows = dataResult.rows.map(({ insert_date, ...rest }) => rest);

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].total, 10),
      data: cleanedRows,
    });
  } catch (err) {
    console.error("Error fetching scheme data:", err);
    res.status(500).json({ success: false, error: "Failed to fetch scheme data" });
  }
};


// ✅ Update scheme data by ID
exports.updateSchemeData = async (req, res) => {
  const { schemeCode, id } = req.params;
  const updatedData = req.body;

  try {
    const tableName = getSchemeTableName(schemeCode);

    const keys = Object.keys(updatedData);
    if (!keys.length) {
      return res.status(400).json({ success: false, error: "No fields provided" });
    }

    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...keys.map(k => updatedData[k])];

    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error("Error updating scheme data:", err);
    res.status(500).json({ success: false, error: "Failed to update scheme data" });
  }
};
