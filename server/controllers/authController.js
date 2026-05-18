const User = require("../models/User");
const Employee = require("../models/Employee");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const { logAudit } = require("../utils/auditLogger");

// ================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // profile image
    const profilePic = req.file ? req.file.filename : "";

    // create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    // auto create employee record
    const count = await Employee.countDocuments();
    const autoId = `EMP-${(count + 1).toString().padStart(3, '0')}`;

    await Employee.create({
      name,
      department: "Not Assigned",
      salary: 0,
      bonus: 0,
      employeeId: autoId,
      userId: newUser._id,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      profilePic: profilePic
        ? `http://localhost:8080/uploads/${profilePic}`
        : "",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // session save
    req.session.user = {
      id: user._id,
      role: user.role,
      email: user.email,
    };

    await logAudit(req, `User ${user.email} successfully logged in`, "Auth");

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        role: user.role,
        email: user.email,
        profilePic: user.profilePic
          ? `http://localhost:8080/uploads/${user.profilePic}`
          : "",
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET CURRENT USER (/me) =================
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.json(null);
    }

    const user = await User.findById(req.session.user.id).select("-password");

    if (!user) {
      return res.json(null);
    }

    // 🔹 Fetch linked employee details
    const employee = await Employee.findOne({ userId: user._id });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic
        ? `http://localhost:8080/uploads/${user.profilePic}`
        : "",
      // 🔹 Employee specific fields
      salary: employee?.salary || 0,
      bonus: employee?.bonus || 0,
      department: employee?.department || "Not Assigned",
      employeeId: employee?.employeeId || "N/A",
      joiningDate: employee?.joiningDate,
      phone: employee?.phone || "N/A",
      address: employee?.address || "N/A",
      sickLeave: employee?.sickLeave,
      casualLeave: employee?.casualLeave,
      annualLeave: employee?.annualLeave
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DASHBOARD =================
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).select("-password");

    res.status(200).json({
      message: "Welcome to dashboard",
      user: {
        ...user._doc,
        profilePic: user.profilePic
          ? `http://localhost:8080/uploads/${user.profilePic}`
          : "",
      },
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET EMPLOYEES =================
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate("userId", "email");

    res.status(200).json(employees);
  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LOGOUT =================
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
};

// ================= UPDATE PROFILE PHOTO =================
exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.session.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // delete old image
    if (user.profilePic) {
      const oldPath = path.join(
        __dirname,
        "..",
        "uploads",
        user.profilePic
      );

      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // save new image
    user.profilePic = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Profile photo updated successfully",
      profilePic: `http://localhost:8080/uploads/${user.profilePic}`,
    });
  } catch (err) {
    console.error("UPDATE PHOTO ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE PROFILE (NAME + EMAIL) =================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const { name, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check duplicate email
    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
          ? `http://localhost:8080/uploads/${user.profilePic}`
          : "",
      },
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE EMPLOYEE (ADMIN) =================

exports.updateEmployee = async (req, res) => {
  try {

    const { department, salary, bonus } = req.body;

    const employeeId = req.params.id;

    // 🔹 Find employee
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    // 🔹 Update fields
    if (department !== undefined)
      employee.department = department;

    if (salary !== undefined)
      employee.salary = salary;

    if (bonus !== undefined)
      employee.bonus = bonus;

    await employee.save();

    res.status(200).json({
      message: "Employee updated successfully",
      employee
    });

  } catch (err) {

    console.error("UPDATE EMPLOYEE ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

// ================= DELETE EMPLOYEE =================

exports.deleteEmployee = async (req, res) => {
  try {

    const employeeId = req.params.id;

    const employee =
      await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    // 🔹 Also delete linked user
    await User.findByIdAndDelete(
      employee.userId
    );

    // 🔹 Delete employee
    await Employee.findByIdAndDelete(
      employeeId
    );

    res.status(200).json({
      message: "Employee deleted successfully"
    });

  } catch (err) {

    console.error("DELETE EMPLOYEE ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};