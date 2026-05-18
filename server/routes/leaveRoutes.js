const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
  getLeaveStats,
  getMyLeaves,
  getLeaveBalance
} = require("../controllers/leaveController");

const isAuthenticated =
  require("../middleware/authMiddleware");

const isAdmin =
  require("../middleware/roleMiddleware");

const upload =
  require("../middleware/uploadMiddleware");



// APPLY LEAVE

router.post(
  "/apply",
  isAuthenticated,
  upload.single("document"),
  applyLeave
);



// USER ROUTES

router.get(
  "/my-leaves",
  isAuthenticated,
  getMyLeaves
);

router.get(
  "/stats",
  isAuthenticated,
  getLeaveStats
);

// NEW BALANCE ROUTE

router.get(
  "/balance",
  isAuthenticated,
  getLeaveBalance
);



// ADMIN ROUTES

router.get(
  "/",
  isAuthenticated,
  isAdmin,
  getLeaves
);

router.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  updateLeaveStatus
);

module.exports = router;