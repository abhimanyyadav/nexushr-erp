import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBullhorn, FaCalendarAlt, FaEnvelopeOpenText, FaAward } from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 1. Fetch User Session Profile
        const resAuth = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/dashboard", {
          credentials: "include",
        });
        if (!resAuth.ok) {
          navigate("/login");
          return;
        }
        const dataAuth = await resAuth.json();
        setUser(dataAuth.user);

        // 🔹 2. Fetch Full Employee Data (for leave balances)
        const resMe = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/me", {
          credentials: "include",
        });
        if (resMe.ok) {
          const dataMe = await resMe.json();
          setEmployee(dataMe);
        }

        // 🔹 3. Fetch Leave Stats
        const resStats = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/leave/stats", {
          credentials: "include",
        });
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setStats(dataStats);
        }

        // 🔹 4. Fetch Recent Leaves
        const resLeaves = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/leave/my-leaves", {
          credentials: "include",
        });
        if (resLeaves.ok) {
          const dataLeaves = await resLeaves.json();
          const sorted = dataLeaves
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentLeaves(sorted);
        }

        // 🔹 5. Fetch Announcements
        const resAnnounce = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/announcements", {
          credentials: "include",
        });
        if (resAnnounce.ok) {
          const dataAnnounce = await resAnnounce.json();
          setAnnouncements(dataAnnounce.slice(0, 5));
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Helper to draw SVG progress rings
  const renderProgressRing = (used = 0, max = 12, color = "#4f46e5") => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const safeMax = max === 0 ? 1 : max;
    const safeUsed = Math.min(used, safeMax);
    const strokeDashoffset = circumference - (safeUsed / safeMax) * circumference;

    return (
      <svg width="80" height="80" className="progress-ring">
        <circle
          stroke="#f3f4f6"
          fill="transparent"
          strokeWidth="6"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx="40"
          cy="40"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontWeight="bold"
          fontSize="11"
          fill="#374151"
        >
          {used}/{max}
        </text>
      </svg>
    );
  };

  if (loading) {
    return <div className="loading">Loading your personalized dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* 🔹 Grid Layout for Widgets */}
      <div className="dashboard-grid">
        {/* Left Side: Stats and Visual Leaves Ring gauges */}
        <div className="dashboard-left-col">
          {/* Section 1: Leave Requests Summaries */}
          <div className="section-card">
            <h3 className="section-title">Leave Approvals Status</h3>
            <div className="stats-row">
              <div className="stat-pill pending">
                <span className="pill-dot"></span>
                <span>{stats.pending} Pending</span>
              </div>
              <div className="stat-pill approved">
                <span className="pill-dot"></span>
                <span>{stats.approved} Approved</span>
              </div>
              <div className="stat-pill rejected">
                <span className="pill-dot"></span>
                <span>{stats.rejected} Rejected</span>
              </div>
            </div>
          </div>

          {/* Section 2: Circular Leave Balance Gauges */}
          <div className="section-card">
            <h3 className="section-title">Leave Allowance Balances</h3>
            <div className="gauges-grid">
              <div className="gauge-item">
                {renderProgressRing(employee?.sickLeave?.used, employee?.sickLeave?.max, "#10b981")}
                <span className="gauge-label">Sick Leave</span>
              </div>
              <div className="gauge-item">
                {renderProgressRing(employee?.casualLeave?.used, employee?.casualLeave?.max, "#f59e0b")}
                <span className="gauge-label">Casual Leave</span>
              </div>
              <div className="gauge-item">
                {renderProgressRing(employee?.annualLeave?.used, employee?.annualLeave?.max, "#3b82f6")}
                <span className="gauge-label">Annual Leave</span>
              </div>
            </div>
          </div>

          {/* Section 3: Recent Leave Requests Table */}
          <div className="table-card">
            <div className="card-header">
              <FaCalendarAlt className="header-icon text-indigo" />
              <h3 className="table-title">Recent Leave Requests</h3>
            </div>
            
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-row">No leaves applied for yet.</td>
                  </tr>
                ) : (
                  recentLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <span className="leave-type-badge">{leave.leaveType}</span>
                      </td>
                      <td className="date-duration">
                        {new Date(leave.fromDate).toLocaleDateString()} ➔ {new Date(leave.toDate).toLocaleDateString()}
                        <span className="day-count">({leave.numberOfDays} days)</span>
                      </td>
                      <td>
                        <span className={`status-tag status-${leave.status}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Bulletins Board / Announcements */}
        <div className="dashboard-right-col">
          <div className="announcement-card">
            <div className="card-header">
              <FaBullhorn className="header-icon text-orange" />
              <h3>Company Bulletin Board</h3>
            </div>

            <div className="announcements-list">
              {announcements.length === 0 ? (
                <div className="announcements-empty">
                  <FaEnvelopeOpenText className="empty-icon" />
                  <p>No notices pinned right now.</p>
                </div>
              ) : (
                announcements.map((announce) => (
                  <div key={announce._id} className={`announce-item priority-${announce.priority.toLowerCase()}`}>
                    <div className="announce-item-header">
                      <span className="announce-tag">{announce.category}</span>
                      <span className={`announce-priority priority-${announce.priority.toLowerCase()}`}>
                        {announce.priority}
                      </span>
                    </div>
                    <h4 className="announce-title">{announce.title}</h4>
                    <p className="announce-text">{announce.content}</p>
                    <span className="announce-date">
                      Posted by Admin on {new Date(announce.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;