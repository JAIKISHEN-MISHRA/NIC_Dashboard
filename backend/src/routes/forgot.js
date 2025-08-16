const express=require('express');
const pool = require('../db');
const {sendEmailOTP}=require('../utils/mailer.js');
const { generateOTP, saveOTP, getOTP, clearOTP } =require('../utils/otpStore.js');

const router = express.Router();

router.post('/forgot-password', async (req, res) => {
  const { username, email, mobile } = req.body;

  if (!username || !email || !mobile) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM m_user1 WHERE user_name = $1 AND email_id = $2 AND mobile_number = $3',
      [username, email, mobile]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found with provided details' });
    }

    const otp = generateOTP();
    saveOTP(email, otp, null); // null for smsOTP (not used here)

    await sendEmailOTP(email, otp);
    console.log(`OTP sent to ${email}: ${otp}`);

    res.json({ message: 'OTP sent to your email address.' });
  } catch (err) {
    console.error('Error during OTP process:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Step 2: Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const record = getOTP(email);
  if (!record) {
    return res.status(400).json({ message: 'No OTP requested for this email' });
  }

  if (Date.now() > record.expiresAt) {
    clearOTP(email);
    return res.status(410).json({ message: 'OTP expired' });
  }

  if (record.emailOTP !== otp) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  // Mark as verified
  saveOTP(email, record.emailOTP, record.smsOTP); // save again, keeping OTPs
  const updated = getOTP(email);
  updated.verified = true;

  res.json({ message: 'OTP verified. You can now reset your password.' });
});

// Step 3: Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Verify OTP first
  const record = getOTP(email);
  if (!record || !record.verified) {
    return res.status(403).json({ message: 'OTP verification required before resetting password' });
  }

  try {
    const updateQuery = `
      UPDATE m_user1 
      SET password = $1, updated_date = NOW(), update_by = 'user', update_ip = '0.0.0.0' 
      WHERE email_id = $2
    `;
    const result = await pool.query(updateQuery, [password, email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    clearOTP(email); // Remove OTP after reset

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports=router;