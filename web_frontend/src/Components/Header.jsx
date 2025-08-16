import React, { useState, useEffect } from 'react';
import '../css/Header.css';
import icon from '../assets/1592-removebg-preview.png';
import logo from '../assets/Accessibility.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import the specific icon
import { faUniversalAccess } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  

  return (
    <header className="govt-header">
      <div className="header-left">
        <img src={icon} alt="Maharashtra Logo" className="govt-icon" />
        <div className="govt-text-inline">
          {/* {language === 'en' ? (
            <span className="eng-text">Maharashtra Government | </span>
          ) : (
            <span className="mar-text">महाराष्ट्र शासन | </span>
          )} */}
            <span className="eng-text">Government of Maharashtra | </span>
            <span className="mar-text">महाराष्ट्र शासन  </span>
        </div>
      </div>

      <div className="header-right">
        {/* <span 
          className={`translator ${language === 'en' ? 'active' : ''}`} 
          onClick={() => setLanguage('en')}
          style={{ cursor: 'pointer', marginRight: '8px' }}
        >
          English
        </span>
        <span> || </span>
        <span 
          className={`translator ${language === 'mr' ? 'active' : ''}`} 
          onClick={() => setLanguage('mr')}
          style={{ cursor: 'pointer', marginLeft: '8px' }}
        >
          Marathi
        </span> */}
        {/* <i class="fa-etch fa-solid fa-universal-access"></i> */}
        <FontAwesomeIcon icon={faUniversalAccess} size="1x" className='access'/>
        {/* <img src={logo} alt="Govt Logo" className="govt-logo" /> */}
      </div>
    </header>
  );
};

export default Header;
