import React from "react";
import "./Help.css";

const Help = () => {
  return (
    <div className="help-page">
      <div className="help-container">
        <h1 className="help-title">Help & User Guide</h1>
        <p className="help-intro">
          Welcome to the <strong>Mahiti Setu Dashboard</strong> — a platform
          designed for <em>everyone</em>, whether you're tech-savvy or just starting
          your digital journey. Our goal is to make data tracking, scheme analysis,
          and decision-making as easy as possible, for all users.
        </p>
        <p className="help-intro">
          The dashboard comes with a clean, easy-to-use interface, ensuring you
          spend less time figuring out how it works and more time making impactful
          decisions. We’ve also made sure it’s accessible for <strong>persons with disabilities</strong>
          — offering features like:
        </p>

        {/* Feature Boxes */}
        <div className="help-features">
          <div className="feature-box">
            <h3>🌍 Multi-Language Support</h3>
            <p>Switch between multiple languages to understand the data in the way you’re most comfortable.</p>
          </div>
          <div className="feature-box">
            <h3>🔍 Easy Navigation</h3>
            <p>Clean menus, clear charts, and simple steps — making it beginner-friendly.</p>
          </div>
          <div className="feature-box">
            <h3>⚙ Accessibility Options</h3>
            <p>Auto-contrast, adjustable text size, and screen reader compatibility for better usability.</p>
          </div>
          <div className="feature-box">
            <h3>📊 Real-Time Data</h3>
            <p>Instant updates ensure you’re always working with the most recent information.</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="help-footer-text">
          <p>
            Whether you’re an administrator reviewing reports, a policy-maker shaping the future,
            or a citizen curious about government initiatives — this platform puts information
            at your fingertips.
          </p>
          <p>
            Need assistance? Visit our <strong><a href="/contact" className="contact-box">Contact Us</a></strong> page, and our support team
            will be happy to guide you through any questions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Help;
