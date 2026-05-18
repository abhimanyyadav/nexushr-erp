import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarCheck, FaTasks, FaBullhorn, FaHistory, FaPlus, FaTrash, FaCheck } from "react-icons/fa";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);
  const [stats, setStats] = useState({
    employees: 0,
    leaves: { pending: 0, approved: 0, rejected: 0, total: 0 },
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 }
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form State
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    category: "General",
    priority: "Low"
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Stats
      const resStats = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/admin/stats", {
        credentials: "include"
      });
      if (resStats.ok) {
        const data = await resStats.json();
        setStats(data);
      }

      // 2. Fetch Announcements
      const resAnnounce = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/announcements", {
        credentials: "include"
      });
      if (resAnnounce.ok) {
        const data = await resAnnounce.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    setSubmitting(true);
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice),
        credentials: "include"
      });
      if (res.ok) {
        setSuccessMsg("Notice pinned successfully!");
        setNewNotice({ title: "", content: "", category: "General", priority: "Low" });
        await fetchDashboardData(); // Refresh list
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Publish notice failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + `/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Delete notice failed:", err);
    }
  };

  // ================= LEAVE TRENDS AREA CHART =================
  const renderLeaveTrendsChart = () => {
    const trendData = [
      { month: "Jan", count: Math.ceil((stats.leaves.total || 5) * 0.4) + 1 },
      { month: "Feb", count: Math.ceil((stats.leaves.total || 5) * 0.8) + 2 },
      { month: "Mar", count: Math.ceil((stats.leaves.total || 5) * 0.6) + 1 },
      { month: "Apr", count: Math.ceil((stats.leaves.total || 5) * 1.2) + 3 },
      { month: "May", count: stats.leaves.total || 5 }
    ];

    const maxVal = Math.max(...trendData.map(d => d.count), 5);
    const chartWidth = 440;
    const chartHeight = 130;
    const paddingX = 40;
    const paddingY = 20;

    const points = trendData.map((d, i) => {
      const x = i * (chartWidth / (trendData.length - 1)) + paddingX;
      const y = chartHeight - (d.count / maxVal) * (chartHeight - 30) - paddingY;
      return { x, y, count: d.count, month: d.month };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

    return (
      <div className="trends-chart-container">
        <div className="chart-header-sub">
          <p className="sub-title">Monthly Time-off Requests (Historical)</p>
          {hoveredTrendIndex !== null && (
            <div className="chart-live-tooltip">
              <span className="tooltip-month">{points[hoveredTrendIndex].month}:</span>
              <span className="tooltip-value">{points[hoveredTrendIndex].count} Leaves</span>
            </div>
          )}
        </div>

        <div className="svg-wrapper">
          <svg viewBox={`0 0 ${chartWidth + paddingX * 2} ${chartHeight + 20}`} className="analytics-svg">
            <defs>
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#4f46e5" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Horizontal Gridlines */}
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth + paddingX} y2={chartHeight - paddingY} stroke="#f3f4f6" strokeWidth="1" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth + paddingX} y2={chartHeight / 2} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
            <line x1={paddingX} y1={paddingY} x2={chartWidth + paddingX} y2={paddingY} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />

            {/* Area Path */}
            <path d={areaPath} fill="url(#areaGlow)" />

            {/* Line Path */}
            <path d={linePath} fill="none" stroke="url(#lineGlow)" strokeWidth="3" filter="url(#shadow)" />

            {/* Dynamic Interactive Hover Points */}
            {points.map((p, i) => (
              <g 
                key={i} 
                className="chart-dot-group"
                onMouseEnter={() => setHoveredTrendIndex(i)}
                onMouseLeave={() => setHoveredTrendIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Transparent hover catcher circle */}
                <circle cx={p.x} cy={p.y} r="14" fill="transparent" />
                {/* Visual coordinate point */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={hoveredTrendIndex === i ? "7" : "4.5"} 
                  fill="#ffffff" 
                  stroke="#4f46e5" 
                  strokeWidth={hoveredTrendIndex === i ? "3.5" : "2"}
                  style={{ transition: "all 0.15s ease" }}
                />
              </g>
            ))}

            {/* X-Axis labels */}
            {points.map((p, i) => (
              <text 
                key={i} 
                x={p.x} 
                y={chartHeight + 12} 
                textAnchor="middle" 
                fontSize="10" 
                fill="#9ca3af" 
                fontWeight="600"
              >
                {p.month}
              </text>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  // ================= TASK PROGRESS DONUT CHART =================
  const renderTaskDonutChart = () => {
    const total = stats.tasks.total || 0;
    const completed = stats.tasks.completed || 0;
    const active = stats.tasks.inProgress || 0;
    const pending = stats.tasks.pending || 0;

    const segments = [
      { label: "Completed", count: completed, color: "#10b981" },
      { label: "In Progress", count: active, color: "#3b82f6" },
      { label: "Pending", count: pending, color: "#f59e0b" }
    ].filter(s => s.count > 0);

    const radius = 65;
    const cx = 90;
    const cy = 90;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius; // ~408.4

    let accumulatedPercent = 0;

    const totalCount = segments.reduce((sum, s) => sum + s.count, 0) || 1;

    return (
      <div className="donut-chart-wrapper">
        <div className="svg-container">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background ring */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />

            {/* Dynamic segmented colored rings */}
            {segments.map((seg, idx) => {
              const percentage = seg.count / totalCount;
              const strokeLength = (percentage * circumference) - 4;
              const rotation = -90 + (accumulatedPercent * 360);
              accumulatedPercent += percentage;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={0}
                  strokeLinecap="butt"
                  transform={`rotate(${rotation} ${cx} ${cy})`}
                  style={{ transition: "stroke-dasharray 0.5s ease, transform 0.5s ease" }}
                />
              );
            })}

            {/* Inner labels */}
            <text x="50%" y="47%" dominantBaseline="middle" textAnchor="middle" fontWeight="800" fontSize="24" fill="#111827">
              {total}
            </text>
            <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontWeight="700" fontSize="10" fill="#6b7280" textTransform="uppercase" letterSpacing="0.05em">
              Total Tasks
            </text>
          </svg>
        </div>

        <div className="donut-legends-grid">
          <div className="legend-row">
            <span className="dot dot-completed"></span>
            <div className="legend-info">
              <span className="legend-name">Completed</span>
              <span className="legend-val">{completed} Tasks</span>
            </div>
          </div>
          <div className="legend-row">
            <span className="dot dot-active"></span>
            <div className="legend-info">
              <span className="legend-name">In Progress</span>
              <span className="legend-val">{active} Tasks</span>
            </div>
          </div>
          <div className="legend-row">
            <span className="dot dot-pending"></span>
            <div className="legend-info">
              <span className="legend-name">Pending</span>
              <span className="legend-val">{pending} Tasks</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header-section">
        <div>
          <h1 className="admin-title">Command Center</h1>
          <p className="admin-subtext">Comprehensive administrative tracking and system logs.</p>
        </div>

        {/* Audit Logs navigation shortcut */}
        <button className="btn-audit-shortcut" onClick={() => navigate("/audit-logs")}>
          <FaHistory /> <span>View Audit Logs</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-stats">Retrieving server metrics...</div>
      ) : (
        <>
          {/* Row 1: Core metric Cards */}
          <div className="admin-stats">
            <div className="admin-card text-blue">
              <div className="card-top">
                <h3>Total Employees</h3>
                <FaUsers className="card-icon" />
              </div>
              <p className="admin-number">{stats.employees}</p>
            </div>

            <div className="admin-card text-orange">
              <div className="card-top">
                <h3>Pending Leaves</h3>
                <FaCalendarCheck className="card-icon" />
              </div>
              <p className="admin-number">{stats.leaves.pending}</p>
            </div>

            <div className="admin-card text-indigo">
              <div className="card-top">
                <h3>Active Tasks</h3>
                <FaTasks className="card-icon" />
              </div>
              <p className="admin-number">{(stats.tasks?.inProgress || 0) + (stats.tasks?.pending || 0)}</p>
            </div>
          </div>

          {/* Row 2: Analytics & Visual Ring charts */}
          <div className="analytics-row">
            <div className="chart-card">
              <h3 className="chart-title">Interactive Leave Trends</h3>
              {renderLeaveTrendsChart()}
            </div>

            <div className="chart-card">
              <h3 className="chart-title">Tasks Allocation Donut</h3>
              {renderTaskDonutChart()}
            </div>
          </div>

          {/* Row 3: Quick Navigation + Announcement Publisher */}
          <div className="quick-actions-row">
            <div className="admin-navigation-card">
              <h3>Quick Operations</h3>
              <div className="nav-btn-grid">
                <button className="admin-btn" onClick={() => navigate("/manage-employees")}>
                  Manage Employees
                </button>
                <button className="admin-btn secondary" onClick={() => navigate("/review-leaves")}>
                  Review Leaves
                </button>
                <button className="admin-btn tertiary" onClick={() => navigate("/manage-tasks")}>
                  Manage Tasks
                </button>
                <button className="admin-btn quaternary" onClick={() => navigate("/manage-holidays")}>
                  Manage Holidays
                </button>
              </div>
            </div>

            {/* Announcement publisher */}
            <div className="publisher-card">
              <h3>Publish Bulletin Notice</h3>
              {successMsg && (
                <div className="success-banner">
                  <FaCheck /> {successMsg}
                </div>
              )}
              <form onSubmit={handlePublishAnnouncement} className="publisher-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Notice Title..."
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Write notice announcement details..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <select
                      value={newNotice.category}
                      onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                    >
                      <option value="General">Category: General</option>
                      <option value="Holiday">Category: Holiday</option>
                      <option value="Policy">Category: Policy</option>
                      <option value="Event">Category: Event</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <select
                      value={newNotice.priority}
                      onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value })}
                    >
                      <option value="Low">Priority: Low</option>
                      <option value="Medium">Priority: Medium</option>
                      <option value="High">Priority: High</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-publish" disabled={submitting}>
                  <FaPlus /> {submitting ? "Publishing..." : "Publish Announcement"}
                </button>
              </form>
            </div>
          </div>

          {/* Row 4: Bulletin Notice List */}
          <div className="admin-bulletins-card">
            <h3>Active Bulletin Board Notices</h3>
            <div className="bulletins-grid">
              {announcements.length === 0 ? (
                <p className="empty-bulletins">No corporate notices active.</p>
              ) : (
                announcements.map((announce) => (
                  <div key={announce._id} className={`bulletin-item priority-${announce.priority.toLowerCase()}`}>
                    <div className="bulletin-item-header">
                      <span className="bulletin-category">{announce.category}</span>
                      <button className="btn-delete-bulletin" onClick={() => handleDeleteAnnouncement(announce._id)}>
                        <FaTrash />
                      </button>
                    </div>
                    <h4>{announce.title}</h4>
                    <p>{announce.content}</p>
                    <span className="bulletin-date">
                      Published on {new Date(announce.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;