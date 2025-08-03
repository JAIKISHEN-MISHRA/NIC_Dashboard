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
  } = req.body;

  try {
    console.log("Reached");
    const result = await pool.query(
      `INSERT INTO signup (
        fname, mname, lname, email, mobile, password,
        state_code, division_code, district_code, taluka_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [fname, mname, lname, email, mobile, password, state, division, district, taluka || null]
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
// Get all pending signups
exports.getPendingSignups = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, fname, mname, lname, email, mobile, state_code, division_code, district_code, taluka_code, created_at
      FROM signup WHERE is_approved = false
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending signups:', err);
    res.status(500).json({ error: 'Failed to fetch pending signups' });
  }
};

// Approve a signup
exports.approveSignup = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE signup SET is_approved = true WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error approving signup:', err);
    res.status(500).json({ error: 'Approval failed' });
  }
};