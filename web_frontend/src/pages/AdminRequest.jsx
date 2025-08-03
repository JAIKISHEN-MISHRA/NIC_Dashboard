import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:5000/api';

export default function AdminRequest() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/pending-signups`);
      setPendingUsers(res.data);
    } catch {
      toast.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`${BASE_URL}/approve/${id}`);
      toast.success('User approved');
      setPendingUsers(prev => prev.filter(user => user.id !== id));
    } catch {
      toast.error('Failed to approve user');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Pending Admin Requests
      </Typography>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.length > 0 ? (
                pendingUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      {[user.fname, user.mname, user.lname].filter(Boolean).join(' ')}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>
                      {[user.state_code, user.division_code, user.district_code, user.taluka_code]
                        .filter(Boolean)
                        .join(' / ')}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleApprove(user.id)}
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No pending requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
