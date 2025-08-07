import React from 'react';
import '../css/Header.css';
import icon from '../assets/1592-removebg-preview.png';
import logo from '../assets/Accessibility.png';

const Header = () => {
  return (
    <header className="govt-header">
      <div className="header-left">
        <img src={icon} alt="Maharashtra Logo" className="govt-icon" />
        <div className="govt-text-inline">
  <span className="eng-text">Maharashtra Shasan | </span>
  <span className="mar-text">महाराष्ट्र शासन</span>
</div>

      </div>

      <div className="header-right">
        <a href="#main-content" className="skip-link">Skip to main content |</a>
        <span className="translator">English to Hindi Translator |</span>
        <img src={logo} alt="Govt Logo" className="govt-logo" />
      </div>
    </header>
  );
};

export default Header;
