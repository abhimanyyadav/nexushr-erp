const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

// ================= CONTROLLERS =================

// 🔹 Auth Controllers
const {
  registerUser,
  loginUser,
  getDashboard,
  logoutUser,
  getCurrentUser,
  updateProfilePhoto,
  updateProfile
} = require("../controllers/authController");

// 🔹 Employee Controllers ✅ (IMPORTANT FIX)
const {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

// ================= MIDDLEWARE =================

const isAuthenticated = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

// ================= VALIDATIONS =================

const {
  registerSchema,
  loginSchema
} = require("../validations/authValidation");


// =====================================================
// ================= AUTH ROUTES =======================
// =====================================================

// Register (with profile pic)
router.post(
  "/register",
  upload.single("profilePic"),
  validate(registerSchema),
  registerUser
);

// Login
router.post(
  "/login",
  validate(loginSchema),
  loginUser
);

// Get current user
router.get(
  "/me",
  isAuthenticated,
  getCurrentUser
);

// Dashboard
router.get(
  "/dashboard",
  isAuthenticated,
  getDashboard
);

// Logout
router.get(
  "/logout",
  isAuthenticated,
  logoutUser
);


// =====================================================
// ================= PROFILE ROUTES =====================
// =====================================================

// Update profile photo
router.put(
  "/update-photo",
  isAuthenticated,
  upload.single("profilePic"),
  updateProfilePhoto
);

// Update name + email
router.put(
  "/update-profile",
  isAuthenticated,
  updateProfile
);


// =====================================================
// ================= ADMIN (EMPLOYEE) ===================
// =====================================================

// ✅ CREATE EMPLOYEE (ADD BUTTON FIX)
router.post(
  "/employee",
  isAuthenticated,
  isAdmin,
  upload.single("profilePic"), // ✅ REQUIRED
  createEmployee
);

// GET ALL EMPLOYEES
router.get(
  "/employee",
  isAuthenticated,
  isAdmin,
  getEmployees
);

// UPDATE EMPLOYEE
router.put(
  "/employee/:id",
  isAuthenticated,
  isAdmin,
  updateEmployee
);

// DELETE EMPLOYEE
router.delete(
  "/employee/:id",
  isAuthenticated,
  isAdmin,
  deleteEmployee
);


// =====================================================
// ================= TEST ROUTE =========================
// =====================================================

router.get(
  "/admin",
  isAuthenticated,
  isAdmin,
  (req, res) => {
    res.send("Welcome Admin");
  }
);

module.exports = router;