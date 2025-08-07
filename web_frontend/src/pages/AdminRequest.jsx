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
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { toast } from 'react-toastify';

const BASE_URL = 'http://localhost:5000/api';

export default function AdminRequest() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const fulluser = JSON.parse(localStorage.getItem('full_user') || '{}');
  const {
    user_code,
    role_code,
    user_level_code,
    state_code,
    division_code,
    district_code,
  } = fulluser;

  const fetchPendingUsers = async () => {
    if (role_code === 'VW' || user_level_code === 'DT') return;

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/pending-signups`, {
        params: {
          page,
          limit: rowsPerPage,
          role_code,
          state_code,
          division_code,
        },
      });

      setPendingUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const submitApproval = async () => {
    if (!selectedUser || !selectedRole || !selectedLevel) {
      toast.error("Please select both Role and User Level");
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/approve/${selectedUser.id}`, {
        approved_by: user_code,
        approved_role_code: selectedRole,
        user_level_code: selectedLevel,
      });

      if (res.data.needsConfirmation) {
        const confirmReplace = window.confirm("A user already exists at this level. Replace?");
        if (confirmReplace) {
          await axios.post(`${BASE_URL}/approve/${selectedUser.id}`, {
            approved_by: user_code,
            approved_role_code: selectedRole,
            user_level_code: selectedLevel,
            forceReplace: true,
          });
          toast.success("Replaced and approved successfully");
        }
      } else {
        toast.success("User approved");
      }

      setOpenDialog(false);
      setSelectedUser(null);
      fetchPendingUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Approval failed");
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, [page, rowsPerPage]);

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Pending Admin Requests
      </Typography>

      {role_code === 'VW' || user_level_code === 'DT' ? (
        <Typography variant="body1" color="error">
          You are not authorized to view any requests.
        </Typography>
      ) : loading ? (
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
                    <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDialog(true);
                        }}
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

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Approval Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">Select Role</InputLabel>
              <Select
                labelId="role-label"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <MenuItem value="AD">Admin</MenuItem>
                <MenuItem value="VW">Viewer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="level-label">Select User Level</InputLabel>
              <Select
                labelId="level-label"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <MenuItem value="ST">State</MenuItem>
                <MenuItem value="DV">Division</MenuItem>
                <MenuItem value="DT">District</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={submitApproval} variant="contained" color="primary">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
