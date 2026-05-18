import { useEffect, useState } from "react";
import { FaHistory, FaSearch, FaFilter, FaInfoCircle, FaShieldAlt, FaCalendarCheck, FaTasks, FaDatabase } from "react-icons/fa";
import "./AuditLogs.css";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/admin/audit-logs", {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Audit log fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                          log.actorName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate live compliance statistics
  const totalCount = logs.length;
  const authCount = logs.filter(l => l.category === "Auth").length;
  const leaveCount = logs.filter(l => l.category === "Leave").length;
  const taskCount = logs.filter(l => l.category === "Task").length;

  return (
    <div className="audit-logs-container">
      {/* 🔹 Header Section */}
      <div className="audit-header">
        <div className="title-section">
          <FaHistory className="header-icon animate-spin-slow" />
          <div>
            <h2>Compliance Audit Trail</h2>
            <p>Cryptographic, read-only chronological ledger tracking all administrative mutations.</p>
          </div>
        </div>
      </div>

      {/* 🔹 Metric Counter Grid */}
      <div className="audit-metrics-grid">
        <div className="metric-mini-card total-logs">
          <div className="mini-card-icon"><FaDatabase /></div>
          <div className="mini-card-info">
            <span className="mini-card-label">Total Logs</span>
            <span className="mini-card-value">{totalCount}</span>
          </div>
        </div>
        <div className="metric-mini-card auth-logs">
          <div className="mini-card-icon"><FaShieldAlt /></div>
          <div className="mini-card-info">
            <span className="mini-card-label">Auth & Security</span>
            <span className="mini-card-value">{authCount}</span>
          </div>
        </div>
        <div className="metric-mini-card leave-logs">
          <div className="mini-card-icon"><FaCalendarCheck /></div>
          <div className="mini-card-info">
            <span className="mini-card-label">Leaves Adjusted</span>
            <span className="mini-card-value">{leaveCount}</span>
          </div>
        </div>
        <div className="metric-mini-card task-logs">
          <div className="mini-card-icon"><FaTasks /></div>
          <div className="mini-card-info">
            <span className="mini-card-label">Tasks Logged</span>
            <span className="mini-card-value">{taskCount}</span>
          </div>
        </div>
      </div>

      {/* 🔹 Filter & Search Panel */}
      <div className="filters-panel">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search action logs, admin accounts, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">Filter by Category: All</option>
            <option value="Auth">Security & Authentication</option>
            <option value="Leave">Leave Management</option>
            <option value="Task">Task Allocations</option>
            <option value="Employee">Employee Operations</option>
            <option value="System">System Configurations</option>
          </select>
        </div>
      </div>

      {/* 🔹 Timeline Activity Stream */}
      <div className="timeline-stream-card">
        {loading ? (
          <div className="stream-loading">
            <div className="spinner"></div>
            <p>Syncing secure enterprise trail ledger...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="stream-empty">
            <FaInfoCircle className="empty-icon" />
            <p>No audit trail logs match your filter criteria.</p>
          </div>
        ) : (
          <div className="timeline-container">
            {filteredLogs.map((log) => {
              const actorInit = log.actorName.charAt(0).toUpperCase();
              const logTime = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const logDate = new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={log._id} className={`timeline-item category-${log.category.toLowerCase()}`}>
                  {/* Left Column: Actor and Time badge */}
                  <div className="timeline-left">
                    <div className="actor-circle-avatar" title={`Actor: ${log.actorName}`}>
                      {actorInit}
                    </div>
                    <div className="time-badge">
                      <span className="date-str">{logDate}</span>
                      <span className="time-str">{logTime}</span>
                    </div>
                  </div>

                  {/* Middle Column: Log details */}
                  <div className="timeline-body">
                    <p className="log-action-text">{log.action}</p>
                    <span className="actor-email-sub">Actor: {log.actorName}</span>
                  </div>

                  {/* Right Column: Category pill and IP tags */}
                  <div className="timeline-right">
                    <span className={`category-pill category-${log.category.toLowerCase()}`}>
                      <span className="pill-dot"></span>
                      {log.category}
                    </span>
                    <span className="ip-tag">{log.ipAddress}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
