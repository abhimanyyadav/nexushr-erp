const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/roleMiddleware");
const { getStats, getAuditLogs } = require("../controllers/adminController");

// ================= ADMIN ROUTES =================
// Only admin can access these endpoints
router.get("/stats", isAuthenticated, isAdmin, getStats);
router.get("/audit-logs", isAuthenticated, isAdmin, getAuditLogs);

module.exports = router;
