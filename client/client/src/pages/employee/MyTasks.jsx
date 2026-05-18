import { useState, useEffect } from "react";
import "./MyTasks.css";

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTasks = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/tasks/my", {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
        console.error("Failed to fetch tasks:", data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + `/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state to reflect change instantly
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (loading) return <div className="page-loader">Loading your tasks...</div>;

  // Calculate progress stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="my-tasks-container">
      {/* 🔹 Progress Header Card */}
      <div className="tasks-progress-card">
        <div className="progress-info-section">
          <div>
            <h1 className="progress-title">Work Workspace</h1>
            <p className="progress-subtitle">
              You've completed <strong>{completedTasks}</strong> of <strong>{totalTasks}</strong> assigned tasks.
            </p>
          </div>
          <div className="completion-percentage">
            <span className="percent-num">{completionRate}%</span>
            <span className="percent-label">Done</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>

        {/* Small stats badges */}
        <div className="progress-summary-badges">
          <span className="badge-summary pending">{pendingTasks} To Do</span>
          <span className="badge-summary active">{inProgressTasks} In Progress</span>
          <span className="badge-summary done">{completedTasks} Completed</span>
        </div>
      </div>

      {/* 🔹 Tasks Columns Board */}
      <div className="tasks-board">
        {/* PENDING COLUMN */}
        <div className="task-column column-pending">
          <div className="column-header">
            <h2>To Do</h2>
            <span className="count">{pendingTasks}</span>
          </div>
          <div className="column-content">
            {tasks.filter(t => t.status === "Pending").length === 0 ? (
              <div className="empty-column-state">No pending tasks</div>
            ) : (
              tasks.filter(t => t.status === "Pending").map(task => (
                <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
              ))
            )}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="task-column column-inprogress">
          <div className="column-header">
            <h2>In Progress</h2>
            <span className="count">{inProgressTasks}</span>
          </div>
          <div className="column-content">
            {tasks.filter(t => t.status === "In Progress").length === 0 ? (
              <div className="empty-column-state">No active work in progress</div>
            ) : (
              tasks.filter(t => t.status === "In Progress").map(task => (
                <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
              ))
            )}
          </div>
        </div>

        {/* COMPLETED COLUMN */}
        <div className="task-column column-completed">
          <div className="column-header">
            <h2>Completed</h2>
            <span className="count">{completedTasks}</span>
          </div>
          <div className="column-content">
            {tasks.filter(t => t.status === "Completed").length === 0 ? (
              <div className="empty-column-state">No completed tasks yet</div>
            ) : (
              tasks.filter(t => t.status === "Completed").map(task => (
                <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onStatusChange }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
  
  return (
    <div className={`my-task-card ${isOverdue ? 'overdue-card' : ''}`}>
      <div className="card-top-section">
        <h3>{task.title}</h3>
        {isOverdue && <span className="overdue-tag">Overdue</span>}
      </div>
      
      <p className="task-desc">{task.description || "No description."}</p>
      
      <div className="task-footer">
        <div className="task-meta-info">
          {task.dueDate && (
            <span className={`date-badge ${isOverdue ? 'overdue-text' : ''}`}>
              📅 Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="card-actions">
          {task.status === "Pending" && (
            <button 
              className="btn-action btn-start"
              onClick={() => onStatusChange(task._id, "In Progress")}
            >
              ▶ Start
            </button>
          )}
          {task.status === "In Progress" && (
            <button 
              className="btn-action btn-complete"
              onClick={() => onStatusChange(task._id, "Completed")}
            >
              ✓ Complete
            </button>
          )}
          {task.status === "Completed" && (
            <span className="completed-indicator">✓ Finished</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
