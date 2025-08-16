const pool = require('../db'); // your PostgreSQL pool

// --- Helpers ---
function getClientIp(req) {
  return (req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for'] || 'NA');
}
function getCurrentUser(req) {
  return (req.user?.user_code || req.body?.user_code || 'system');
}

// --- Ensure scheme-specific data table (uses transaction client) ---
async function ensureSchemeDataTable(client, scheme_code) {
  const tableName = `t_${scheme_code}_data`;
  const createQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      state_code VARCHAR(2) NOT NULL,
      division_code VARCHAR(3),
      district_code VARCHAR(3) NOT NULL,
      taluka_code VARCHAR(4) NOT NULL,
      year VARCHAR(4),
      month VARCHAR(2),
      data JSONB,
      is_active BOOLEAN NOT NULL DEFAULT true,
      insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      insert_ip VARCHAR NOT NULL DEFAULT 'NA',
      insert_by VARCHAR NOT NULL DEFAULT 'NA',
      updated_date TIMESTAMP NULL,
      update_ip VARCHAR NULL,
      update_by VARCHAR NULL
    );
  `;
  await client.query(createQuery);
}

// --- Recursive insert for categories ---
async function insertCategoryRecursive(client, scheme_code, parent_id, category, req, level = 1) {
  const { category_name, category_name_ll, children = [] } = category;

  const cols = ['scheme_code', 'parent_id', 'category_name', 'category_name_ll', 'level', 'insert_by', 'insert_ip'];
  const values = [
    scheme_code,
    parent_id,
    category_name,
    category_name_ll,
    level,
    getCurrentUser(req),
    getClientIp(req)
  ];

  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

  const insertSQL = `
    INSERT INTO public.m_scheme_category (${cols.map(c => `"${c}"`).join(', ')})
    VALUES (${placeholders})
    RETURNING category_id
  `;

  const result = await client.query(insertSQL, values);
  const newCategoryId = result.rows[0].category_id;

  for (const child of children) {
    await insertCategoryRecursive(client, scheme_code, newCategoryId, child, req, level + 1);
  }
}

// --- Controller: Insert scheme and categories ---
exports.insertSchemeWithCategories = async (req, res) => {
  const {
    scheme_name,
    scheme_name_ll,
    categories = [],
    state_code,
    division_code = null,
    district_code = null,
    taluka_code = null,
    frequency // Value from request body
  } = req.body;

  // --- Start of Changes ---

  // 1. Added validation for the new frequency field
  if (!scheme_name?.trim()) {
    return res.status(400).json({ error: 'scheme_name is required' });
  }
  if (!frequency?.trim()) {
    return res.status(400).json({ error: 'frequency is required' });
  }
  if (!state_code) {
    return res.status(400).json({ error: 'state_code is required' });
  }
  
  // --- End of Changes ---

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- Start of Changes ---

    // 2. Added 'frequency' to the columns list
    const cols = [
      'scheme_name',
      'scheme_name_ll',
      'state_code',
      'division_code',
      'district_code',
      'taluka_code',
      'frequency',
      'insert_by',
      'insert_ip'
    ];

    // 3. Added the frequency variable to the values list
    const values = [
      scheme_name,
      scheme_name_ll,
      state_code,
      division_code,
      district_code,
      taluka_code,
      frequency,
      getCurrentUser(req),
      getClientIp(req)
    ];
    
    // --- End of Changes ---

    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');

    const insertSQL = `
      INSERT INTO public.m_scheme (${cols.map(c => `"${c}"`).join(', ')})
      VALUES (${placeholders})
      RETURNING scheme_code
    `;
    const result = await client.query(insertSQL, values);
    const scheme_code = result.rows[0].scheme_code;

    // Create scheme-specific table inside same transaction
    await ensureSchemeDataTable(client, scheme_code);

    // Insert all categories
    for (const category of categories) {
      await insertCategoryRecursive(client, scheme_code, null, category, req);
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Scheme and categories inserted successfully', scheme_code });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting scheme:', err);
    return res.status(500).json({ error: 'Failed to insert scheme and categories', details: err.message });
  } finally {
    client.release();
  }
};


exports.getSchemeCategoryTree = async (req, res) => {
  const { schemeCode } = req.params;

  try {
    // Fetch categories
    const categoryResult = await pool.query(
      `SELECT category_id, parent_id, category_name, category_name_ll
       FROM m_scheme_category
       WHERE scheme_code = $1
       ORDER BY level, sort_order, category_id`,
      [schemeCode]
    );

    const flatList = categoryResult.rows;

    const buildTree = (parentId = null) => {
      return flatList
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          category_id:cat.category_id,
          category_name: cat.category_name,
          category_name_ll: cat.category_name_ll,
          children: buildTree(cat.category_id)
        }));
    };

    const tree = buildTree();

    // Fetch location data
    const locationResult = await pool.query(
      `SELECT state_code, division_code, district_code, taluka_code
       FROM m_scheme
       WHERE scheme_code = $1
       LIMIT 1`,
      [schemeCode]
    );

    let location = null;
    if (locationResult.rows.length > 0) {
      const loc = locationResult.rows[0];
      if (loc.state_code || loc.division_code || loc.district_code || loc.taluka_code) {
        location = {};
        if (loc.state_code) location.state_code = loc.state_code;
        if (loc.division_code) location.division_code = loc.division_code;
        if (loc.district_code) location.district_code = loc.district_code;
        if (loc.taluka_code) location.taluka_code = loc.taluka_code;
      }
    }

    // Always send same structure
    res.json({
      data: tree,
      location
    });

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




// Insert scheme data
// Insert scheme data
exports.insertSchemeData = async (req, res) => {
  const {
    division_code,
    scheme_code,
    state_code,
    district_code,
    taluka_code,
    year,
    month,
    data,
  } = req.body;

  const {
    user_code,
    state_code: user_state_code,
    division_code: user_division_code,
    district_code: user_district_code,
    user_level_code,
    role_code
  } = req.user;

  // derive insert metadata
  const insert_by = getCurrentUser(req);
  const insert_ip = getClientIp(req);

  try {
    // 1️⃣ Validate login data
    if (!user_code || !user_level_code || !division_code) {
      return res.status(401).json({ error: "Please login to upload" });
    }

    // 2️⃣ Validate State access
    if ((user_level_code === "ST" || user_level_code === "SA") && state_code !== user_state_code) {
      return res.status(401).json({ error: "User not of same State" });
    }

    // 3️⃣ If user_level_code = DT but role_code = VW → reject
    if (user_level_code === "DT" && role_code === "VW") {
      return res.status(403).json({ error: "You have viewing rights, not upload rights" });
    }

    // Basic data validation
    if (data === undefined || data === null) {
      return res.status(400).json({ error: "data field is required" });
    }
    // ensure data is JSON-serializable
    let jsonData;
    try {
      jsonData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      // if parsing fails, try to stringify original value
      try {
        jsonData = JSON.parse(JSON.stringify(data));
      } catch (err) {
        return res.status(400).json({ error: "Invalid data payload; must be JSON" });
      }
    }

    // 4️⃣ Validate scheme_code to avoid SQL injection
    const validScheme = await pool.query(
      "SELECT scheme_code FROM m_scheme WHERE scheme_code=$1",
      [scheme_code]
    );
    if (validScheme.rowCount === 0) {
      return res.status(400).json({ error: "Invalid scheme_code" });
    }

    // 5️⃣ If DT + AD → Insert into Approval table (store insert_by/insert_ip)
    if (user_level_code === "DT" && role_code === "AD" && district_code === user_district_code) {
      const approvalQuery = `
        INSERT INTO approval (
          user_code, user_division_code, user_level_code, role_code,
          division_code, scheme_code, state_code, district_code, taluka_code,
          year, month, data, insert_by, insert_ip, approved_by, created_at, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NULL,NOW(),'PENDING')
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
        JSON.stringify(jsonData),
        insert_by,
        insert_ip
      ];

      const result = await pool.query(approvalQuery, approvalValues);
      return res.status(200).json({
        message: "Data staged for approval",
        inserted_id: result.rows[0].id
      });
    }

    // 6️⃣ Default → Direct insert into scheme-specific table (include insert_by/insert_ip)
    const tableName = `t_${scheme_code}_data`;

    const insertQuery = `
      INSERT INTO ${tableName} (
        state_code, division_code, district_code, taluka_code,
        year, month, data, insert_by, insert_ip
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
    `;

    const values = [
      state_code,
      division_code,
      district_code,
      taluka_code,
      year,
      month,
      JSON.stringify(jsonData),
      insert_by,
      insert_ip
    ];

    const result = await pool.query(insertQuery, values);
    res.status(200).json({
      message: "Data inserted",
      inserted_id: result.rows[0].id
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


exports.updateSuperUserInfo = async (req, res) => {
  const { first_name, middle_name, last_name, email_id, mobile_number } = req.body;
  const targetUserCode = req.body.user_code; // Superuser being updated
  const updaterUserCode = req.user?.user_code; // from middleware

  if (!targetUserCode) {
    return res.status(400).json({ error: "user_code is required" });
  }

  if (!first_name || !last_name || !email_id || !mobile_number) {
    return res.status(400).json({ error: "All required fields must be filled" });
  }

  try {
    const updateResult = await pool.query(
      `UPDATE m_user1
       SET first_name = $1,
           middle_name = $2,
           last_name = $3,
           email_id = $4,
           mobile_number = $5,
           updated_date = NOW(),
           update_ip = $6,
           update_by = $7,
           is_assigned = TRUE
       WHERE user_code = $8
       RETURNING *`,
      [
        first_name.trim(),
        (middle_name || "").trim(),
        last_name.trim(),
        email_id.trim().toLowerCase(),
        mobile_number.trim(),
        getClientIp(req) || req.ip || "",
        updaterUserCode || targetUserCode, // use middleware user_code or self if missing
        targetUserCode, // WHERE clause
      ]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Superuser profile updated successfully",
      user: updateResult.rows[0],
    });
  } catch (err) {
    console.error("Superuser update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
