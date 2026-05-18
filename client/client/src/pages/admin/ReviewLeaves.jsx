import { useEffect, useState } from "react";
import "./ReviewLeaves.css";
import "./AdminDashboard.css"; // Reuse dashboard classes for consistency

const ReviewLeaves = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  // 🔹 Fetch all leave requests
  const fetchLeaves = () => {
    setLoading(true);
    fetch("http://localhost:8080/api/leave", {
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch leaves");
        return res.json();
      })
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.log("Error fetching leaves:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // 🔹 Update Leave Status
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8080/api/leave/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      const updatedLeave = await res.json();

      // 🔹 Update UI instantly
      setRequests(prev =>
        prev.map(req => (req._id === id ? updatedLeave : req))
      );
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  // 🔹 Stats
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  // 🔹 Show leaves based on currently selected filter tab
  const filteredRequests = requests.filter(r => r.status === statusFilter);

  return (
    <div className="admin-dashboard review-page">
      <div className="admin-header-section">
        <h1 className="admin-title">Review Leave Requests</h1>
        <p className="admin-subtext">Manage and approve employee time-off requests.</p>
      </div>

      {/* 🔹 Interactive Stats Cards (acting as filter buttons) */}
      <div className="admin-stats">
        <div 
          className={`admin-card ${statusFilter === "pending" ? "active-filter-pending" : ""}`}
          onClick={() => setStatusFilter("pending")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
        >
          <h3>Pending Requests</h3>
          <p className="admin-number" style={{ color: "#ca8a04" }}>{pendingCount}</p>
        </div>
        <div 
          className={`admin-card ${statusFilter === "approved" ? "active-filter-approved" : ""}`}
          onClick={() => setStatusFilter("approved")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
        >
          <h3>Approved Leaves</h3>
          <p className="admin-number" style={{ color: "#16a34a" }}>{approvedCount}</p>
        </div>
        <div 
          className={`admin-card ${statusFilter === "rejected" ? "active-filter-rejected" : ""}`}
          onClick={() => setStatusFilter("rejected")}
          style={{ cursor: "pointer", transition: "all 0.2s" }}
        >
          <h3>Rejected Leaves</h3>
          <p className="admin-number" style={{ color: "#dc2626" }}>{rejectedCount}</p>
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="admin-card table-card">
        <h3 className="table-title" style={{ textTransform: "capitalize" }}>
          {statusFilter} Queue
        </h3>

        {loading ? (
          <p className="loading-text">Loading leave requests...</p>
        ) : (
          <div className="table-responsive">
            <table className="review-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Deduction</th>
                  {statusFilter === "pending" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={statusFilter === "pending" ? 6 : 5} className="empty-state">
                      🎉 No {statusFilter} leave requests in this queue.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => {
                    const user = req.employeeId?.userId || {};
                    const employeeName = user.name || "Unknown User";
                    const employeeEmail = user.email || "No email";
                    const profilePic = user.profilePic 
                      ? `http://localhost:8080/uploads/${user.profilePic}`
                      : null;
                    const initial = employeeName.charAt(0).toUpperCase();

                    return (
                      <tr key={req._id}>
                        <td>
                          <div className="employee-cell">
                            {profilePic ? (
                              <img src={profilePic} alt="avatar" className="emp-avatar" />
                            ) : (
                              <div className="emp-avatar-placeholder">{initial}</div>
                            )}
                            <div className="emp-details">
                              <span className="emp-name">{employeeName}</span>
                              <span className="emp-email">{employeeEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="leave-type-badge">{req.leaveType}</span>
                        </td>
                        <td>
                          <div className="leave-dates">
                            <span className="date">{new Date(req.fromDate).toLocaleDateString()}</span>
                            <span className="to-arrow">→</span>
                            <span className="date">{new Date(req.toDate).toLocaleDateString()}</span>
                          </div>
                          <span className="days-count">{req.numberOfDays} Day(s)</span>
                        </td>
                        <td>
                          <span className={`status-badge ${req.status}`}>{req.status}</span>
                        </td>
                        <td>
                          <span className="deduction-amount">
                            ₹{Math.round((req.employeeId?.salary || 0) / 30 * req.numberOfDays)}
                          </span>
                        </td>
                        {statusFilter === "pending" && (
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-outline-approve"
                                onClick={() => updateStatus(req._id, "approved")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn-outline-reject"
                                onClick={() => updateStatus(req._id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewLeaves;