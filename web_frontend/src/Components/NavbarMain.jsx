import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import {jwtDecode} from 'jwt-decode';

import '../css/NavbarMain.css';
import emblem from '../assets/emblem.png';
import img1 from '../assets/NIC_Preview-1.png';

// Helper: decode JWT token
const getTokenData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token); // decode JWT
    return {
      role_code: decoded.role_code,
      user_code: decoded.user_code,
      full_name: decoded.full_name,
    };
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

const NavbarMain = () => {
  const navigate = useNavigate();
  const tokenData = useMemo(() => getTokenData(), []);
  const isLoggedIn = !!tokenData;
  const roleCode = tokenData?.role_code;
  const name = tokenData?.full_name;

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/login");
  };

  const handleLogin = () => navigate("/login");

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={emblem} alt="Emblem" className="nav-emblem" />
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>

          {isLoggedIn && (roleCode === "AD" || roleCode === "SA") && (
            <>
              <li><Link to="/AdminRequest">Admin Request</Link></li>
              <li><Link to="/AddScheme">Add Scheme</Link></li>
            </>
          )}

          {isLoggedIn && ["VW", "AD", "DE", "SA"].includes(roleCode) && (
            <li><Link to="/admindash">Admin Dashboard</Link></li>
          )}

          {isLoggedIn && (roleCode === "DE" || roleCode === "SA") && (
            <>
              <li><Link to="/upload">Upload</Link></li>
              <li><Link to="/viewdata">Edit Data</Link></li>
              <li><Link to="/approval">Approve Data</Link></li>
            </>
          )}
        </ul>
      </div>

      <div className="nav-right">
        <img src={img1} alt="Extra Icon" className="nav-extra-icon" />

        {isLoggedIn ? (
          <>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ color: 'black' }}
            >
              <AccountCircle fontSize="large" />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle1">{name}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              borderRadius: '8px',
              padding: '6px 16px',
              boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
            }}
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavbarMain;
