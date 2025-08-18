const pool = require('../db');
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Ensure JWT_SECRET is loaded


exports.handleSignup = async (req, res) => {
 const {
  fname,
  mname,
  lname,
  email,
  mobile,
  password,
  state,
  division,
  district,
  taluka,
  department, 
} = req.body;


  try {
   const result = await pool.query(
  `INSERT INTO signup (
    fname, mname, lname, email, mobile, password,
    state_code, division_code, district_code, taluka_code, department
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *`,
  [
    fname,
    mname,
    lname,
    email,
    mobile,
    password,
    state,
    division || null,
    district || null,
    taluka || null,
    department || null
  ]
);


    res.status(201).json({ message: 'Signup successful. Awaiting admin approval.', user: result.rows[0] });
  } catch (err) {
    console.error('Signup failed:', err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists.' });
    } else {
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
};

exports.getPendingSignups = async (req, res) => {
  const {
    user_code,
    role_code,
    user_level_code,
    state_code,
    division_code,
    district_code,
  } = req.user;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // ✅ Check if current user is legal
    const userCheckQuery = `
      SELECT 1 FROM m_user1
      WHERE user_code = $1
        AND is_active = true
        AND is_assigned = true
    `;
    const userCheckRes = await pool.query(userCheckQuery, [user_code]);
    if (userCheckRes.rowCount === 0) {
      return res.status(403).json({ error: "User is not authorized" });
    }

    // ✅ Base query for pending signups
    let baseQuery = `
      SELECT id, fname, mname, lname, email, mobile,
             state_code, division_code, district_code, taluka_code, created_at
      FROM signup
      WHERE is_approved = false
    `;
    let countQuery = `SELECT COUNT(*) FROM signup WHERE is_approved = false`;
    const params = [];

    // Apply filters based on role_code and user_level_code
    if (role_code === 'SA') {
      if (state_code) {
        baseQuery += ` AND state_code = $1`;
        countQuery += ` AND state_code = $1`;
        params.push(state_code);
      }
    } else if (role_code === 'AD') {
      if (user_level_code === 'ST') {
        baseQuery += ` AND state_code = $1`;
        countQuery += ` AND state_code = $1`;
        params.push(state_code);
      } else if (user_level_code === 'DV') {
        baseQuery += ` AND state_code = $1 AND division_code = $2`;
        countQuery += ` AND state_code = $1 AND division_code = $2`;
        params.push(state_code, division_code);
      } else if (user_level_code === 'DT') {
        baseQuery += ` AND state_code = $1 AND division_code = $2 AND district_code = $3`;
        countQuery += ` AND state_code = $1 AND division_code = $2 AND district_code = $3`;
        params.push(state_code, division_code, district_code);
      } else {
        return res.json({ users: [], total: 0 });
      }
    } else {
      return res.json({ users: [], total: 0 });
    }

    // Pagination
    baseQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(baseQuery, params);
    const countRes = await pool.query(countQuery, params.slice(0, -2));

    const total = parseInt(countRes.rows[0].count);

    res.json({
      users: result.rows,
      total,
    });
  } catch (err) {
    console.error('Error fetching pending signups:', err);
    res.status(500).json({ error: 'Failed to fetch pending signups' });
  }
};



// Approve a signup (sets is_approved = true and records approved_by)
exports.approveSignup = async (req, res) => {
  const { id } = req.params;
  // body: forceReplace, approved_role_code, user_level_code
  const { forceReplace = false, approved_role_code, user_level_code } = req.body;

  // approver info from JWT (req.user)
  const approver = req.user || {};
  const approverCode = approver.user_code;
  const approverRole = approver.role_code;
  const approverLevel = approver.user_level_code;
  const approverState = approver.state_code;
  const approverDivision = approver.division_code;
  const approverDistrict = approver.district_code;

  try {
    // 0. Basic validation of inputs
    if (!approved_role_code || !user_level_code) {
      return res.status(400).json({ error: "approved_role_code and user_level_code required" });
    }
    // 1. Get signup data
    const result = await pool.query(`SELECT * FROM signup WHERE id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Signup not found" });

    const signup = result.rows[0];
    const {
      fname, mname, lname, email, mobile, password,
      state_code, division_code, district_code, taluka_code,
      department
    } = signup;

    // 2. Permission checks: ensure approver is allowed to approve this signup
    // SA & ST => must be same state
    if (approverLevel === 'SA' || approverLevel === 'ST') {
      if (!approverState || approverState !== state_code) {
        return res.status(403).json({ error: "Not authorized: approver's state must match signup state" });
      }
    }

    // DV => must be same division
    if (approverLevel === 'DV') {
      if (!approverDivision || approverDivision !== division_code) {
        return res.status(403).json({ error: "Not authorized: approver's division must match signup division" });
      }
    }

    // DT => must be same district AND approver must not be role DE or VW
    if (approverLevel === 'DT') {
      if (approverRole === 'DE' || approverRole === 'VW') {
        return res.status(403).json({ error: "Not authorized: DE or VW cannot approve as DT" });
      }
      if (!approverDistrict || approverDistrict !== district_code) {
        return res.status(403).json({ error: "Not authorized: approver's district must match signup district" });
      }
    }

    // Additional rule: approver must not be empty (safety)
    if (!approverCode) {
      return res.status(401).json({ error: "Approver information missing" });
    }

    // 3. If assigning a DT-level user, check for existing active DT admin and handle forceReplace
    if (user_level_code === 'DT') {
      const existing = await pool.query(
        `SELECT * FROM m_user1 WHERE district_code = $1 AND is_active = true AND user_level_code = 'DT'`,
        [district_code]
      );

      if (existing.rows.length > 0 && !forceReplace) {
        return res.status(409).json({
          error: "District admin already exists. Confirm replacement?",
          needsConfirmation: true,
        });
      }

      if (existing.rows.length > 0 && forceReplace) {
        await pool.query(
          `UPDATE m_user1 SET is_active = true, is_assigned = false 
           WHERE district_code = $1 AND user_level_code = 'DT' AND is_active = true`,
          [district_code]
        );
      }
    }

    // 4. Find a pre-seeded unassigned user matching level + role + location
    // Keep original loose matching (NULL or equal) so pre-seeded entries with NULL location can be used.
    const userRes = await pool.query(
      `SELECT * FROM m_user1
       WHERE is_active = true AND is_assigned = false
         AND role_code = $1 AND user_level_code = $2
         AND (state_code IS NULL OR state_code = $3)
         AND (division_code IS NULL OR division_code = $4)
         AND (district_code IS NULL OR district_code = $5)
       LIMIT 1`,
      [approved_role_code, user_level_code, state_code, division_code, district_code]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "No pre-created user available for assignment." });
    }

    const user = userRes.rows[0];
    const { user_code } = user;

    // 5. Prepare dynamic update for m_user1.
    // We'll include base columns always, and optionally set role-specific code columns
    // (admin_state_code/admin_division_code/admin_district_code/viewer_code/data_code)
    // only if they exist in m_user1. Query information_schema for existence.

    const colsToCheck = [
      'admin_state_code', 'admin_division_code', 'admin_district_code',
      'viewer_code', 'data_code'
    ];

    const q = await pool.query(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_name = 'm_user1' AND column_name = ANY($1::text[])`,
      [colsToCheck]
    );
    const existingCols = new Set(q.rows.map(r => r.column_name));

    // decide role-specific assignments
    // For AD (Admin) we map user_level_code -> admin_* column to the signup location
    const extraAssignments = {}; // columnName -> value
    const lcRole = (approved_role_code || '').toUpperCase();

    if (lcRole === 'AD' || lcRole === 'ADMIN') {
      if (user_level_code === 'ST' && existingCols.has('admin_state_code')) {
        extraAssignments['admin_state_code'] = state_code;
      } else if (user_level_code === 'DV' && existingCols.has('admin_division_code')) {
        extraAssignments['admin_division_code'] = division_code;
      } else if (user_level_code === 'DT' && existingCols.has('admin_district_code')) {
        extraAssignments['admin_district_code'] = district_code;
      }
    } else if (lcRole === 'VW' || lcRole === 'VIEWER') {
      if (existingCols.has('viewer_code')) extraAssignments['viewer_code'] = user_code; // or some value — here we set created user's code
    } else if (lcRole === 'DE' || lcRole === 'DATA') {
      if (existingCols.has('data_code')) extraAssignments['data_code'] = user_code;
    }

    // 6. Build the UPDATE query dynamically with placeholders
    const baseFields = [
      'user_name', 'password', 'email_id', 'mobile_number',
      'first_name', 'middle_name', 'last_name',
      'state_code', 'division_code', 'district_code', 'taluka_code',
      'department_name',
      'is_active', 'is_assigned',
      'insert_by', 'insert_ip', 'insert_date'
    ];

    const basePlaceholders = [];
    const values = [];

    // values order must match placeholders
    values.push(email);           basePlaceholders.push('$' + values.length); // user_name
    values.push(password);        basePlaceholders.push('$' + values.length); // password
    values.push(email);           basePlaceholders.push('$' + values.length); // email_id
    values.push(mobile);          basePlaceholders.push('$' + values.length); // mobile_number
    values.push(fname);           basePlaceholders.push('$' + values.length); // first_name
    values.push(mname);           basePlaceholders.push('$' + values.length); // middle_name
    values.push(lname);           basePlaceholders.push('$' + values.length); // last_name
    values.push(state_code);      basePlaceholders.push('$' + values.length); // state_code
    values.push(division_code);   basePlaceholders.push('$' + values.length); // division_code
    values.push(district_code);   basePlaceholders.push('$' + values.length); // district_code
    values.push(taluka_code);     basePlaceholders.push('$' + values.length); // taluka_code
    values.push(department);      basePlaceholders.push('$' + values.length); // department_name
    values.push(true);            basePlaceholders.push('$' + values.length); // is_active
    values.push(true);            basePlaceholders.push('$' + values.length); // is_assigned
    values.push(approverCode);    basePlaceholders.push('$' + values.length); // insert_by
    values.push('127.0.0.1');     basePlaceholders.push('$' + values.length); // insert_ip
    values.push(new Date());      basePlaceholders.push('$' + values.length); // insert_date

    // append extraAssignments
    const extraSets = [];
    for (const [col, val] of Object.entries(extraAssignments)) {
      values.push(val);
      extraSets.push(`${col} = $${values.length}`);
    }

    const setClauses = baseFields.map((f, i) => `${f} = ${basePlaceholders[i]}`).concat(extraSets);

    const updateQuery = `
      UPDATE m_user1 SET
        ${setClauses.join(',\n        ')}
      WHERE user_code = $${values.length + 1}
    `;

    values.push(user_code); // last placeholder is WHERE user_code = $n

    await pool.query(updateQuery, values);

    // 7. Mark signup approved using approver's code
    await pool.query(
      `UPDATE signup SET is_approved = true, approved_by = $1, updated_date = NOW(), update_by = $2 WHERE id = $3`,
      [approverCode, approverCode, id]
    );

    return res.json({ success: true, assigned_user_code: user_code });
  } catch (err) {
    console.error("Approval error:", err);
    return res.status(500).json({ error: "Approval failed", details: err.message });
  }
};





exports.handleLogin = async (req, res) => {
  const { user_name, password } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  if (!user_name || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const userResult = await pool.query(
      `SELECT * FROM m_user1 WHERE user_name = $1`,
      [user_name]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = userResult.rows[0];

    // 🔒 Account lock check
    if (user.login_attempts >= 3 && user.last_login_timestamp) {
      const lastLoginTime = new Date(user.last_login_timestamp);
      const hoursDiff = (new Date() - lastLoginTime) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        return res.status(403).json({
          error: "Account locked due to multiple failed attempts. Try after 24 hours.",
        });
      } else {
        await pool.query(
          `UPDATE m_user1 SET login_attempts = 0 WHERE user_code = $1`,
          [user.user_code]
        );
      }
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "Account is inactive. Contact admin." });
    }

    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      await pool.query(
        `UPDATE m_user1
         SET login_attempts = login_attempts + 1,
             last_login_timestamp = NOW()
         WHERE user_code = $1`,
        [user.user_code]
      );
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // ✅ Reset login attempts
    await pool.query(
      `UPDATE m_user1 SET login_attempts = 0, last_login_timestamp = NOW() WHERE user_code = $1`,
      [user.user_code]
    );

    // 👇 Payload for JWT
    const payload = {
      user_code: user.user_code,
      role_code: user.role_code,
      user_level_code: user.user_level_code,
      state_code: user.state_code,
      division_code: user.division_code,
      district_code: user.district_code,
      taluka_code: user.taluka_code,
      department_name: user.department_name,
      full_name: `${user.first_name || ""} ${user.middle_name || ""} ${user.last_name || ""}`.trim(),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });

    // 🔑 Superuser + default password special case
    const isSuperUser = user_name.startsWith("Super");
    const forcePasswordChange = password === process.env.hash;

    if (isSuperUser && forcePasswordChange) {
      // Send missing fields info for frontend to fill
      const missingFields = ['mobile_number', 'email_id', 'first_name', 'middle_name', 'last_name'].reduce(
        (arr, field) => {
          if (!user[field] || user[field].trim() === '') arr.push(field);
          return arr;
        },
        []
      );

      return res.status(200).json({
        message: "Superuser login. Please fill required fields.",
        token,
        force_password_change: true,
        missing_fields: missingFields,
        user_code: user.user_code,
      });
    }

    // Normal login response
    return res.status(200).json({
      message: "Login successful",
      token,
      force_password_change: forcePasswordChange,
      state_code: user.state_code,
      division_code: user.division_code,
      district_code: user.district_code,
      taluka_code: user.taluka_code
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


exports.handleChangePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const { user_code } = req.user; // get user_code from middleware

  if (!old_password || !new_password) {
    return res.status(400).json({ error: "Old and new passwords are required" });
  }

  try {
    // Fetch the stored password
    const result = await pool.query(
      `SELECT password FROM m_user1 WHERE user_code = $1 AND is_active = true`,
      [user_code]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    const storedPassword = result.rows[0].password.trim();

    // Compare old password with stored password
    if (storedPassword !== old_password) {
      return res.status(403).json({ error: "Old password is incorrect" });
    }

    // Check new password is different
    if (storedPassword === new_password) {
      return res.status(400).json({ error: "New password cannot be the same as the old password" });
    }

    // Update to new password
    await pool.query(
      `UPDATE m_user1 
       SET password = $1, updated_date = CURRENT_TIMESTAMP 
       WHERE user_code = $2`,
      [new_password, user_code]
    );

    return res.status(200).json({ message: "Password changed successfully" });

  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

