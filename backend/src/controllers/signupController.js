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

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

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

