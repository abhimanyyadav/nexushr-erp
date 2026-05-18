import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ isOpen, onClose }) {

  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);



  // ================= FETCH USER =================

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await fetch(
          "http://localhost:8080/api/auth/me",
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        setUser(data);

      } catch (err) {

        console.log("Sidebar user error:", err);

      } finally {

        setLoading(false);

      }

    };

    fetchUser();

  }, []);



  // ================= ACTIVE LINK =================

  const isActive = (path) => {
    return location.pathname === path
      ? "menu-item active"
      : "menu-item";
  };



  // ================= UI =================

  if (loading) {

    return (
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          <FaTimes />
        </button>
        <h2 className="sidebar-logo">
          NexusHR ERP
        </h2>

        <p style={{ padding: "20px" }}>
          Loading...
        </p>

      </div>
    );

  }



  return (

    <div className={`sidebar ${isOpen ? "open" : ""}`}>

      {/* 🔹 Close Button for Mobile */}
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
        <FaTimes />
      </button>

      {/* 🔹 Logo */}

      <h2 className="sidebar-logo">
        NexusHR ERP
      </h2>



      {/* 🔹 Menu */}

      <nav className="sidebar-menu">

        {/* ================= COMMON ================= */}

        <Link
          to={user?.role === "admin" ? "/admin" : "/dashboard"}
          className={isActive(user?.role === "admin" ? "/admin" : "/dashboard")}
        >
          {user?.role === "admin" ? "Command Center" : "Dashboard"}
        </Link>



        {/* ================= EMPLOYEE ================= */}

        {["employee", "manager", "hr"].includes(user?.role) && (

          <>

            <Link
              to="/apply-leave"
              className={isActive("/apply-leave")}
            >
              Apply Leave
            </Link>

            <Link
              to="/my-leaves"
              className={isActive("/my-leaves")}
            >
              My Leaves
            </Link>

            <Link
              to="/salary"
              className={isActive("/salary")}
            >
              My Salary
            </Link>
            
            <Link
              to="/my-tasks"
              className={isActive("/my-tasks")}
            >
              My Tasks
            </Link>

            <Link
              to="/holidays"
              className={isActive("/holidays")}
            >
              Holiday Calendar
            </Link>

          </>

        )}



        {/* ================= ADMIN ================= */}

        {user?.role === "admin" && (

          <>

            <Link
              to="/manage-employees"
              className={isActive("/manage-employees")}
            >
              Manage Employees
            </Link>

            <Link
              to="/review-leaves"
              className={isActive("/review-leaves")}
            >
              Review Leaves
            </Link>

            <Link
              to="/manage-holidays"
              className={isActive("/manage-holidays")}
            >
              Manage Holidays
            </Link>

            <Link
              to="/manage-tasks"
              className={isActive("/manage-tasks")}
            >
              Manage Tasks
            </Link>

            <Link
              to="/audit-logs"
              className={isActive("/audit-logs")}
            >
              System Audit Logs
            </Link>

          </>

        )}



        {/* ================= PROFILE ================= */}

        <Link
          to="/profile"
          className={isActive("/profile")}
        >
          Profile
        </Link>

      </nav>



      {/* 🔹 Bottom User Section */}

      <div className="sidebar-user">

        <img
          src={
            user?.profilePic 
              ? (user.profilePic.startsWith("http") ? user.profilePic : `http://localhost:8080/uploads/${user.profilePic}`)
              : "https://via.placeholder.com/40"
          }
          alt="user"
          className="sidebar-avatar"
        />

        <div>

          <p className="sidebar-name">
            {user?.name}
          </p>

          <p className="sidebar-role">
            {user?.role}
          </p>

          <p className="sidebar-id" style={{ fontSize: "0.7rem", color: "#a0aec0", marginTop: "2px" }}>
            ID: {user?.employeeId || "N/A"}
          </p>

        </div>

      </div>

    </div>

  );

}

export default Sidebar;