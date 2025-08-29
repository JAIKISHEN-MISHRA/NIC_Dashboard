// src/components/NavbarTop.jsx
import React from "react";
import logo5 from "../assets/logo5.png";
import flag from "../assets/flag.png";

const NavbarTop = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container-fluid px-3 px-md-5">
        {/* layout stacks on small screens and becomes a single row on md+ */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center py-2">
          
          {/* left group: flag + site name */}
          <div className="d-flex align-items-center">
            <img
              src={flag}
              alt="Flag"
              className="img-fluid"
              style={{ height: 80, width: "auto", objectFit: "contain", transition: "transform .2s" }}
            />
            <span
              className="ms-2 fw-bold text-primary"
              style={{ fontSize: 26, letterSpacing: 1 }}
            >
              MahitiSetu
            </span>
          </div>

          {/* right group: logo (will move under left group on small screens) */}
          <div className="mt-2 mt-md-0">
            <img
              src={logo5}
              alt="Organisation logo"
              className="img-fluid"
              style={{ height: 80, width: "auto", objectFit: "contain", transition: "transform .2s" }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarTop;
