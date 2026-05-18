const express = require("express");
const router = express.Router();
const { addHoliday, getHolidays, deleteHoliday, toggleHoliday } = require("../controllers/holidayController");
const isAuthenticated = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/roleMiddleware");

// Public (all authenticated users can view)
router.get("/", isAuthenticated, getHolidays);

// Admin only
router.post("/", isAuthenticated, isAdmin, addHoliday);
router.post("/toggle", isAuthenticated, isAdmin, toggleHoliday);
router.delete("/:id", isAuthenticated, isAdmin, deleteHoliday);

module.exports = router;
