import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>

      <div className="footer-container">

        {/* LEFT SIDE */}

        <div className="footer-left">

          <h2 className="footer-logo">
            NexusLeave
          </h2>

          <p>
            Revolutionizing enterprise leave
            management with modern, intuitive,
            and secure workflows.
          </p>

        </div>

        {/* MIDDLE LINKS */}

        <div className="footer-links">

          <div>
            <h4>Product</h4>
            <ul>
              <li>Features</li>
              <li>Security</li>
              <li>Pricing</li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>About</li>
              <li>Careers</li>
              <li>Help Center</li>
            </ul>
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="footer-social">

          <span>🐦</span>
          <span>💼</span>
          <span>🐙</span>

        </div>

      </div>

      {/* Bottom */}

      <div className="footer-bottom">
        © 2026 NexusLeave. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;