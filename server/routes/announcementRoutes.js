const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncements, deleteAnnouncement } = require("../controllers/announcementController");
const isAuthenticated = require("../middleware/authMiddleware");

// Role checker middleware
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Administrator access required" });
};

router.get("/", isAuthenticated, getAnnouncements);
router.post("/", isAuthenticated, isAdmin, createAnnouncement);
router.delete("/:id", isAuthenticated, isAdmin, deleteAnnouncement);

module.exports = router;
