import React from "react";

import Navbar from "../../components/layout/Navbar";

import Hero from "../../components/common/Hero";
import FeatureCard from "../../components/common/FeatureCard";
import Footer from "../../components/common/Footer";

import "./Landing.css";

const Landing = () => {

  return (

    <>

      {/* Navbar */}

     

      {/* HERO */}

      <Hero />

      {/* FEATURES SECTION */}

      <section className="features">

        <div className="features-container">

          <h2 className="features-heading">
            Everything You Need to Manage PTO
          </h2>

          <p className="features-subtext">
            A complete suite of tools designed to handle
            complex leave policies, multi-tier approvals,
            and team calendars.
          </p>

          <div className="features-grid">

            <FeatureCard
              icon="📄"
              title="Apply Leave Easily"
              description="Intuitive 3-step application process with real-time balance checking and automated conflict detection."
            />

            <FeatureCard
              icon="📈"
              title="Track Leave Status"
              description="Monitor your request journey through the approval pipeline with instant push and email notifications."
            />

            <FeatureCard
              icon="🛡"
              title="Admin Approval System"
              description="Robust dashboard for HR managers to review, approve, or deny requests with a single click."
            />

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <Footer />

    </>

  );

};

export default Landing;