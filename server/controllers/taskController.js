const Task = require("../models/Task");
const User = require("../models/User");
const { sendNotification } = require("./notificationController");
const { logAudit } = require("../utils/auditLogger");

// ================= CREATE TASK (ADMIN) =================
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: "Assigned user not found" });
      }
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.session.user.id,
      dueDate
    });

    if (assignedTo) {
      try {
        await sendNotification(
          assignedTo,
          req.session.user.id,
          "task_assign",
          "New Task Assigned",
          `You have been assigned a new task: "${title}".`
        );
      } catch (notifErr) {
        console.error("FAIL TO SEND TASK ASSIGNED NOTIFICATION:", notifErr);
      }
    }

    await logAudit(req, `Created task "${title}" and assigned it to employee`, "Task");

    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL TASKS (ADMIN) =================
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email role profilePic")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("GET ALL TASKS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET MY TASKS (EMPLOYEE/MANAGER/HR) =================
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const tasks = await Task.find({ assignedTo: userId })
      .populate("assignedBy", "name email role profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("GET MY TASKS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE TASK STATUS =================
exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const userId = req.session.user.id;
    const role = req.session.user.role;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Admins can update any task, users can only update their own
    if (role !== "admin" && task.assignedTo?.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    if (status) task.status = status;
    if (role === "admin" && assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
    }
    await task.save();

    await logAudit(req, `Updated task "${task.title}" status to "${task.status}"`, "Task");

    res.status(200).json({ message: "Task status updated", task });
  } catch (err) {
    console.error("UPDATE TASK STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
