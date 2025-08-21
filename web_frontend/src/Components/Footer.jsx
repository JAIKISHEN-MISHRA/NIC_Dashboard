import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import nicLogo from "../assets/nic.png"; 
import digitalIndiaLogo from "../assets/digital_india.png"; 

const Footer = () => {
  return (
    <footer className="gov-footer">
      {/* Navigation Links */}
      <div className="footer-top">
        <Link to="/about">ABOUT</Link>
        <Link to="/contact">CONTACT US</Link>
        <Link to="/help">HELP</Link>
        
      </div>

      {/* Info Section */}
      <div className="footer-middle">
        <p>
          Content of MahitiSetu is published, managed and owned by Respective Departments, Government of India.
        </p>
        <p>
          © NIC, Developed and hosted by{" "}
          <a
            href="https://www.nic.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            National Informatics Centre
          </a>
           {" "}and{" "}
           <a
            href="https://www.meity.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
             Ministry of Electronics & Information Technology
          </a>
          , Government of India
        </p>
        
      </div>

      {/* Logos */}
      <div className="footer-bottom">
        <img src={nicLogo} alt="NIC" />
        <img src={digitalIndiaLogo} alt="Digital India" />
      </div>
    </footer>
  );
};

export default Footer;
