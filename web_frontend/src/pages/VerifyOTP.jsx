import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Box, Typography, TextField, Button, Alert, Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const BASE_URL = "http://localhost:5000/api";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = location.state || {};
  const email = userInfo?.email;

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!userInfo) navigate('/forgot');

    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer, userInfo, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
      setMessage(res.data.message);
      // Navigate to ResetPassword page
      navigate('/reset', { state: { email } });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setCanResend(false);
      setTimer(60);
      setMessage('');
      await axios.post(`${BASE_URL}/forgot-password`, { email, username: userInfo.username, mobile: userInfo.mobile });
      setMessage('OTP resent successfully');
    } catch {
      setMessage('Failed to resend OTP');
      setCanResend(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" mb={3} textAlign="center">Verify OTP</Typography>
        <form onSubmit={handleVerify}>
          <TextField
            label="Email OTP"
            value={otp}
            onChange={(e) => { if (/^\d{0,6}$/.test(e.target.value)) setOtp(e.target.value); }}
            fullWidth
            margin="normal"
            required
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Button type="submit" variant="contained" color="primary" fullWidth>Verify OTP</Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="contained" fullWidth disabled={!canResend || resending} onClick={handleResend} color={canResend ? 'primary' : 'secondary'}>
                {resending ? 'Resending...' : 'Resend OTP'}
              </Button>
            </Grid>
          </Grid>
          {!canResend && <Typography mt={1}>Resend OTP in {timer}s</Typography>}
          {message && <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>}
        </form>
      </Box>
    </Container>
  );
};

export default VerifyOTP;
