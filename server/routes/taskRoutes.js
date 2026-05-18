const express = require("express");
const router = express.Router();

const {
  createTask,
  getAllTasks,
  getMyTasks,
  updateTaskStatus
} = require("../controllers/taskController");

const isAuthenticated = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/roleMiddleware");

// ================= ADMIN ROUTES =================
router.post("/", isAuthenticated, isAdmin, createTask);
router.get("/", isAuthenticated, isAdmin, getAllTasks);

// ================= EMPLOYEE/MANAGER/HR ROUTES =================
router.get("/my", isAuthenticated, getMyTasks);
router.put("/:id/status", isAuthenticated, updateTaskStatus);

module.exports = router;
