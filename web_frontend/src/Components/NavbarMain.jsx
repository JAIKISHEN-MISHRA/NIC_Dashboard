import React from 'react';
import '../css/NavbarMain.css';
import emblem from '../assets/emblem.png';
import img1 from '../assets/NIC_Preview-1.png';
import img2 from '../assets/NIC_Preview-1.png';

const NavbarMain = () => {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={emblem} alt="Emblem" className="nav-emblem" />
        <img src={img1} alt="Extra Icon" className="nav-extra-icon" />
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#help">Help</a></li>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact Us</a></li>
        </ul>
      </div>

      <div className="nav-right">
        <img src={img1} alt="Right Icon 1" className="nav-image" />
        <img src={img2} alt="Right Icon 2" className="nav-image" />
      </div>
    </nav>
  );
};

export default NavbarMain;
