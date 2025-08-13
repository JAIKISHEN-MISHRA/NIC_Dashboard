import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import '../css/NavbarMain.css';
import emblem from '../assets/emblem.png';
import img1 from '../assets/NIC_Preview-1.png';
import img2 from '../assets/NIC_Preview-1.png';

const NavbarMain = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={emblem} alt="Emblem" className="nav-emblem" />
        <img src={img1} alt="Extra Icon" className="nav-extra-icon" />

        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          {isLoggedIn && <li><Link to="/AdminRequest">Admin Request</Link></li>}
          {isLoggedIn && <li><Link to="/upload">Upload</Link></li>}
          {isLoggedIn && <li><Link to="/AddScheme">Add Scheme</Link></li>}
        </ul>
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <>
            <img src={img1} alt="Right Icon 1" className="nav-image" />
            <img src={img2} alt="Right Icon 2" className="nav-image" />
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogout}
              sx={{
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '8px',
                padding: '6px 16px'
              }}
            >
              Logout
            </Button>
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
              boxShadow: '0px 4px 6px rgba(0,0,0,0.2)'
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
