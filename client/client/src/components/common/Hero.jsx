import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
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
          >
            Access Dashboard →
          </Link>

          <Link
            to="/register"
            className="btn-secondary"
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

    </section>
  );
};

export default Hero;