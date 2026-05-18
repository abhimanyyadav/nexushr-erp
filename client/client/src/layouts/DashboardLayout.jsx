import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import { FaBell, FaCheckDouble, FaSignOutAlt, FaCircle, FaBars } from "react-icons/fa";
import "./DashboardLayout.css";

function DashboardLayout() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch current user details
  const fetchUser = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/me", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch notifications list
  const fetchNotifications = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/notifications", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchNotifications();
    // Poll for notifications every 10 seconds for a dynamic, real-time feel!
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/notifications/read-all", {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markSingleRead = async (id) => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + `/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/logout", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Dynamic Overlay Backdrop for mobile menu */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Panel Wrapper */}
      <div className="dashboard-container">
        {/* Sleek TopBar */}
        <header className="dashboard-topbar">
          <div className="topbar-welcome" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="btn-menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Toggle Sidebar Menu">
              <FaBars />
            </button>
            <div>
              <h2>Welcome back, <span className="welcome-name">{user?.name || "Employee"}</span> 👋</h2>
              <p className="topbar-date">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Bell Icon & Dropdown Container */}
            <div className="notif-wrapper">
              <button 
                className={`btn-icon-topbar ${showNotif ? "active" : ""}`}
                onClick={() => setShowNotif(!showNotif)}
              >
                <FaBell className="bell-icon" />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <button className="btn-mark-all" onClick={markAllRead}>
                        <FaCheckDouble /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <p>All quiet here! No notifications.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          className={`notif-item ${notif.isRead ? "read" : "unread"}`}
                          onClick={() => markSingleRead(notif._id)}
                        >
                          <div className="notif-item-header">
                            <h4 className="notif-item-title">{notif.title}</h4>
                            {!notif.isRead && <FaCircle className="unread-dot" />}
                          </div>
                          <p className="notif-item-message">{notif.message}</p>
                          <span className="notif-item-time">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Shortcut */}
            <button className="btn-logout-topbar" onClick={handleLogout} title="Log Out">
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;