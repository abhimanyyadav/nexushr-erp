import { useState, useEffect } from "react";
import "./ManageTasks.css";

const ManageTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/tasks", {
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
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/auth/employee", {
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        // Only keep employees who have a valid linked user account
        const validEmployees = data.filter((emp) => emp.userId);
        setEmployees(validEmployees);
      } else {
        setEmployees([]);
        console.error("Failed to fetch employees:", data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await fetchTasks();
      await fetchEmployees();
      setLoading(false);
    };
    initData();
  }, []);

  const handleAssignTask = async (e, isDraft = false) => {
    e.preventDefault();
    if (!title) return alert("Title is required!");
    if (!isDraft && !assignedTo) return alert("Please select an assignee, or click 'Save as Draft'.");

    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + "/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          assignedTo: isDraft ? null : assignedTo,
          dueDate,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setAssignedTo("");
        setDueDate("");
        fetchTasks();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create task");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch((window.API_BASE_URL || (window.API_BASE_URL || "http://localhost:8080")) + `/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        fetchTasks();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  if (loading) return <div className="page-loader">Loading Tasks...</div>;

  // Calculate Progress Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="manage-tasks-container">
      <div className="mt-header">
        <h1>Task Management Center</h1>
        <p>Assign tasks and track organizational progress</p>
      </div>

      {/* PROGRESS CHART SECTION */}
      <div className="mt-card progress-card">
        <div className="progress-info">
          <h2>Overall Progress</h2>
          <span className="progress-text">{progressPercent}% Completed</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>{completedTasks} Completed</span>
          <span>{totalTasks - completedTasks} Remaining</span>
        </div>
      </div>

      <div className="mt-content">
        {/* ASSIGN TASK FORM */}
        <div className="mt-card assign-task-card">
          <h2>Assign New Task</h2>
          <form onSubmit={handleAssignTask} className="assign-form">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                placeholder="e.g. Q3 Financial Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Detailed instructions..."
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned (Save for Later)</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp.userId._id}>
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit-task">
                Assign Task Now
              </button>
              <button 
                type="button" 
                className="btn-save-draft"
                onClick={(e) => handleAssignTask(e, true)}
              >
                Save as Draft (Assign Later)
              </button>
            </div>
          </form>
        </div>

        {/* TASK BOARD / LIST */}
        <div className="mt-card tasks-list-card">
          <h2>All Tasks Overview</h2>
          <div className="tasks-grid">
            {tasks.length === 0 ? (
              <p className="no-tasks">No tasks assigned yet.</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className={`task-item status-${task.status.replace(" ", "").toLowerCase()}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <select 
                      className="admin-task-dropdown status-dropdown"
                      value={task.status}
                      onChange={(e) => updateTask(task._id, { status: e.target.value })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <p className="task-desc">{task.description || "No description provided."}</p>
                  <div className="task-meta">
                    <div className="assignee">
                      <select 
                        className="admin-task-dropdown assignee-dropdown"
                        value={task.assignedTo?._id || ""}
                        onChange={(e) => updateTask(task._id, { assignedTo: e.target.value })}
                      >
                        <option value="">Unassigned</option>
                        {employees.map(emp => (
                          <option key={emp._id} value={emp.userId._id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {task.dueDate && (
                      <div className="due-date">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTasks;
