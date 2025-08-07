import React from 'react';
import '../css/OnboardingSteps.css';
import regIcon from '../assets/Accessibility.png';
// import signupIcon from '../assets/signup.png';
// import requestIcon from '../assets/request.png';
// import dashboardIcon from '../assets/dashboard.png';

const steps = [
  { id: 1, title: "Registration", step: "STEP 1", icon: regIcon },
  { id: 2, title: "Sign Up", step: "STEP 2", icon: regIcon },
  { id: 3, title: "Service Request", step: "STEP 3", icon: regIcon },
  { id: 4, title: "Dashboard", step: "STEP 4", icon: regIcon }
];

const OnboardingSteps = () => {
  return (
    <div className="onboarding-container">
      <h2 className="onboarding-title">
        On-Boarding <span>Procedure</span>
      </h2>

      <div className="steps-wrapper">
        {steps.map((item, index) => (
          <div className="step-card" key={item.id}>
            <p className="step-number">{item.step}</p>
            <div className="circle-icon">
              <img src={item.icon} alt={item.title} />
            </div>
            <p className="step-label">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingSteps;
