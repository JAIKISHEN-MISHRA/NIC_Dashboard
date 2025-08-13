import React from "react";
import "./About.css";
import aboutImage from "../assets/aboutus.jpeg";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-text">
          <h1>About Our Dashboard</h1>
          <p>
            Our Government Schemes Dashboard is designed to give administrators
            a clear, data-driven view of ongoing programs. With real-time
            analytics, gender-wise statistics, and interactive visualizations,
            the platform empowers decision-makers to track progress, identify
            gaps, and plan better interventions.
          </p>
          <p>
            Whether you're reviewing monthly reports, comparing trends, or
            managing datasets, our dashboard makes complex information simple,
            visual, and actionable — all in one secure place.
          </p>
        </div>
        <div className="about-image">
          <img src={aboutImage} alt="Dashboard Overview" />
        </div>
      </section>

      {/* Info Boxes */}
      <section className="about-boxes">
        <div className="box">
          <h3>📊 Data Visualization</h3>
          <p>
            Interactive charts and graphs provide an instant snapshot of scheme
            performance over time.
          </p>
        </div>
        <div className="box">
          <h3>🔍 Scheme Insights</h3>
          <p>
            View gender-based and demographic breakdowns to target resources
            effectively.
          </p>
        </div>
        <div className="box">
          <h3>⚡ Real-time Updates</h3>
          <p>
            Stay updated with live statistics, ensuring decisions are made with
            the latest data.
          </p>
        </div>
        <div className="box">
          <h3>🔒 Secure Access</h3>
          <p>
            Built with role-based authentication and encrypted connections to
            keep your data safe.
          </p>
        </div>
      </section>
    </div>
  );
};

<<<<<<< Updated upstream
export default About;
=======
export default About;
>>>>>>> Stashed changes
