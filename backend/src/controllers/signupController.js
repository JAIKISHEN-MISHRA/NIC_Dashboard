const pool = require('../db');


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
  const { role_code, state_code, division_code } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
      SELECT id, fname, mname, lname, email, mobile,
             state_code, division_code, district_code, taluka_code, created_at
      FROM signup
      WHERE is_approved = false
    `;
    let countQuery = `SELECT COUNT(*) FROM signup WHERE is_approved = false`;
    let params = [];

    if (role_code === 'SA') {
      // no filter
    } else if (role_code === 'ST') {
      baseQuery += ` AND state_code = $1`;
      countQuery += ` AND state_code = $1`;
      params.push(state_code);
    } else if (role_code === 'DV') {
      baseQuery += ` AND division_code = $1`;
      countQuery += ` AND division_code = $1`;
      params.push(division_code);
    } else {
      return res.json({ users: [], total: 0 });
    }

    baseQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(baseQuery, params);
    const countRes = await pool.query(countQuery, params.slice(0, -2)); // just filters

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
  const { forceReplace = false, approved_by, approved_role_code, user_level_code } = req.body;

  try {
    // 1. Get signup data
    const result = await pool.query(`SELECT * FROM signup WHERE id = $1`, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Signup not found" });

    const signup = result.rows[0];
    const {
      fname, mname, lname, email, mobile, password,
      state_code, division_code, district_code, taluka_code,
      department
    } = signup;

    // 2. If DT-level, check existing active user
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
          `UPDATE m_user1 SET is_active = false, is_assigned = false 
           WHERE district_code = $1 AND user_level_code = 'DT' AND is_active = true`,
          [district_code]
        );
      }
    }

    // 3. Find pre-seeded unassigned user matching level + location
    const userRes = await pool.query(
      `SELECT * FROM m_user1
       WHERE is_active = false AND is_assigned = false
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

    // 4. Assign the user
    await pool.query(
      `UPDATE m_user1 SET
         user_name = $1,
         password = $2,
         email_id = $3,
         mobile_number = $4,
         first_name = $5,
         middle_name = $6,
         last_name = $7,
         state_code = $8,
         division_code = $9,
         district_code = $10,
         taluka_code = $11,
         department_name = $12,
         is_active = true,
         is_assigned = true,
         insert_by = $13,
         insert_ip = '127.0.0.1',
         insert_date = NOW()
       WHERE user_code = $14`,
      [
        email, password, email, mobile, fname, mname, lname,
        state_code, division_code, district_code, taluka_code,
        department, approved_by, user_code
      ]
    );

    // 5. Mark signup approved
    await pool.query(
      `UPDATE signup SET is_approved = true, approved_by = $1 WHERE id = $2`,
      [approved_by, id]
    );

    return res.json({ success: true, assigned_user_code: user_code });
  } catch (err) {
    console.error("Approval error:", err);
    return res.status(500).json({ error: "Approval failed" });
  }
};




exports.handleLogin = async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const userResult = await pool.query(
      `SELECT * FROM m_user1 WHERE user_name = $1`,
      [user_name]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = userResult.rows[0];

    // 🔒 Check if account is locked due to login attempts
    if (user.login_attempts >= 3 && user.last_login_timestamp) {
      const lastLoginTime = new Date(user.last_login_timestamp);
      const now = new Date();
      const hoursDiff = (now - lastLoginTime) / (1000 * 60 * 60); // in hours

      if (hoursDiff < 24) {
        return res.status(403).json({ error: 'Account locked due to multiple failed attempts. Try after 24 hours.' });
      } else {
        // Reset login attempts after 24 hours
        await pool.query(
          `UPDATE m_user1 SET login_attempts = 0 WHERE user_code = $1`,
          [user.user_code]
        );
      }
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is inactive. Contact admin.' });
    }

    const isPasswordValid = user.password === password || password === 'NIC@2024';

    if (!isPasswordValid) {
      // ❌ Invalid password → Increment login_attempts and set last_login_timestamp
      await pool.query(
        `UPDATE m_user1
         SET login_attempts = login_attempts + 1,
             last_login_timestamp = NOW()
         WHERE user_code = $1`,
        [user.user_code]
      );

      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // ✅ Password is valid → Reset login_attempts
    await pool.query(
      `UPDATE m_user1 SET login_attempts = 0, last_login_timestamp = NOW() WHERE user_code = $1`,
      [user.user_code]
    );

    // 👇 Prepare user data
    const payload = {
      user_code: user.user_code,
      role_code: user.role_code,
      user_level_code: user.user_level_code,
      state_code: user.state_code,
      division_code: user.division_code,
      district_code: user.district_code,
      taluka_code: user.taluka_code,
      department_name: user.department_name,
      full_name: `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim(),
    };

    // ✅ If backdoor password was used, force password change
    const forcePasswordChange = password === 'NIC@2024';

    return res.status(200).json({
      message: 'Login successful',
      user: payload,
      force_password_change: forcePasswordChange,
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.handleChangePassword = async (req, res) => {
  const { user_code, old_password, new_password } = req.body;

  try {
    const result = await pool.query(
      `SELECT password FROM m_user1 WHERE user_code = $1 AND is_active = true`,
      [user_code]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    const storedPassword = result.rows[0].password.trim(); // In case NIC@2024 has extra padding
    const isDefaultPassword = storedPassword === "NIC@2024";

    const isMatch = isDefaultPassword
      ? old_password === "NIC@2024"
      : storedPassword === old_password;

    if (!isMatch) {
      return res.status(403).json({ error: "Old password is incorrect" });
    }

    if (storedPassword === new_password) {
      return res.status(400).json({ error: "New password cannot be the same as the old password" });
    }

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

