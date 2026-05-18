import React from 'react'
import { Link } from "react-router-dom";
import { FaCalendarCheck } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">

      <Link to="/" className="logo-link">
        <h2 className="logo">
          <FaCalendarCheck />
          NexusHR
        </h2>
      </Link>

      <div className="buttons">

        <Link to="/login" className="login-btn">
          Login
        </Link>

        <Link to="/register" className="register-btn">
          Register
        </Link>

      </div>

    </div>
  )
}

export default Navbar