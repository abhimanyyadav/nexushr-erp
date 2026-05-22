import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleProceed = () => {
    setShowModal(false);
    navigate("/login");
  };

  return (
    <section className="hero">

      {/* Background Shape */}
      <div className="hero-bg-left"></div>
      <div className="hero-bg-right"></div>

      <div className="hero-container">

        {/* Badge */}
        <div className="hero-badge">
          New: AI-Powered Leave Forecasting ✨
        </div>

        {/* Heading */}
        <h1 className="hero-heading">
          Employee Leave Management <br />
          <span className="highlight">Simplified</span> for Modern <br />
          Teams
        </h1>

        {/* Description */}
        <p className="hero-description">
          Ditch the spreadsheets. NexusLeave provides a seamless ERP
          experience for employees to request time off and for HR
          teams to manage approvals in seconds.
        </p>

        {/* Buttons */}
        <div className="hero-buttons">

          <Link
            to="/login"
            className="btn-primary"
            onClick={handleButtonClick}
          >
            Access Dashboard →
          </Link>

          <Link
            to="/login"
            className="btn-secondary"
            onClick={handleButtonClick}
          >
            Start Free Trial
          </Link>

        </div>

        {/* Stats */}
        <div className="hero-stats">

          <div className="stat">
            <h3>99.9%</h3>
            <p>UPTIME</p>
          </div>

          <div className="stat">
            <h3>500+</h3>
            <p>ENTERPRISES</p>
          </div>

          <div className="stat">
            <h3>12ms</h3>
            <p>RESPONSE</p>
          </div>

          <div className="stat">
            <h3>ISO</h3>
            <p>CERTIFIED</p>
          </div>

        </div>

      </div>

      {/* Custom Premium Modal Popup */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🔒</div>
            <h2 className="modal-title">Authentication Required</h2>
            <p className="modal-text">
              Please log in to your account first to access the dashboard and tools.
            </p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-primary" onClick={handleProceed}>
                Log In Now
              </button>
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Hero;