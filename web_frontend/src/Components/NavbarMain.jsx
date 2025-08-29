// src/components/NavbarMainBootstrap.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // correct default import for jwt-decode
import emblem from '../assets/emblem.png';
import '../css/NavbarMain.css'; // optional, keep any custom rules here

const getTokenData = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      role_code: decoded.role_code,
      user_code: decoded.user_code,
      full_name: decoded.full_name,
    };
  } catch (err) {
    console.error('Failed to decode token:', err);
    return null;
  }
};

const NavbarMain = () => {
  const navigate = useNavigate();
  const tokenData = useMemo(() => getTokenData(), []);
  const isLoggedIn = !!tokenData;
  const roleCode = tokenData?.role_code;
  const name = tokenData?.full_name || '';

  const firstName = name ? name.split(' ')[0].toLowerCase() : '';

  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapse = () => setCollapsed((c) => !c);

  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserOpen(false);
    navigate('/login');
  };

  const handleLogin = () => navigate('/login');

  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={emblem} alt="Emblem" style={{ height: 40, marginRight: 10 }} />
          <span className="fw-semibold">MahitiSetu</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-expanded={!collapsed}
          aria-label="Toggle navigation"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${!collapsed ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={() => setCollapsed(true)}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/dashboard" className="nav-link" onClick={() => setCollapsed(true)}>
                Dashboard
              </Link>
            </li>

            {isLoggedIn && (roleCode === 'AD' || roleCode === 'SA') && (
              <>
                <li className="nav-item">
                  <Link to="/AdminRequest" className="nav-link" onClick={() => setCollapsed(true)}>
                    Admin Request
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/AddScheme" className="nav-link" onClick={() => setCollapsed(true)}>
                    Add Scheme
                  </Link>
                </li>
              </>
            )}

            {isLoggedIn && (roleCode === 'DE' || roleCode === 'SA') && (
              <>
                <li className="nav-item">
                  <Link to="/upload" className="nav-link" onClick={() => setCollapsed(true)}>
                    Upload
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/viewdata" className="nav-link" onClick={() => setCollapsed(true)}>
                    Edit Data
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/approval" className="nav-link" onClick={() => setCollapsed(true)}>
                    Approve Data
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {!isLoggedIn ? (
              <button
                type="button"
                className="btn btn-light btn-sm fw-semibold"
                onClick={handleLogin}
              >
                Login
              </button>
            ) : (
              <div className="dropdown" ref={userMenuRef}>
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center dropdown-toggle"
                  type="button"
                  onClick={() => setUserOpen((o) => !o)}
                  aria-expanded={userOpen}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-person-circle"
                    viewBox="0 0 16 16"
                    style={{ marginRight: 8 }}
                  >
                    <path d="M13.468 12.37C12.758 11.226 11.52 10.5 10 10.5s-2.758.726-3.468 1.87A6.987 6.987 0 0 1 1 8a6.987 6.987 0 0 1 5.532-6.37C7.242 2.774 8.48 3.5 10 3.5s2.758-.726 3.468-1.87A6.987 6.987 0 0 1 15 8a6.987 6.987 0 0 1-1.532 4.37z"/>
                    <path fillRule="evenodd" d="M10 5a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/>
                  </svg>
                  <small className="text-white text-capitalize">{firstName}</small>
                </button>

                <ul
                  className={`dropdown-menu dropdown-menu-end ${userOpen ? 'show' : ''}`}
                  style={{ minWidth: 200 }}
                >
                  <li className="dropdown-item-text">
                    <strong>{name}</strong>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarMain;
