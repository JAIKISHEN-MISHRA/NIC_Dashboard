import React from 'react';
import Header from '../Components/Header';
import NavbarMain from '../Components/NavbarMain';
import BannerSlider from '../Components/Banner';
import '../css/MainPage.css'; // create this CSS file
import OnboardingSteps from './Onboarding';

export default function MainPage() {
  return (
    <>
      <div className="fixed-header">
        <Header />
        <NavbarMain />
      </div>

      <div className="content-below">
        <BannerSlider />

        <div className="dashboard-info">
          <h2>Dashboard Overview</h2>
          <p>
            The dashboard allows users to view scheme-wise data in a visual format, enabling
            easier analysis and tracking. This includes charts, graphs, and other visual tools
            that make it simple to understand the distribution, performance, and impact of
            government schemes.
          </p>
        </div>
        <OnboardingSteps/>
      </div>
    </>
  );
}
