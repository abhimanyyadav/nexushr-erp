const Leave = require("../models/Leave");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { sendNotification } = require("./notificationController");
const { logAudit } = require("../utils/auditLogger");

// ================= APPLY LEAVE =================

exports.applyLeave = async (req, res) => {
  try {

    const { leaveType, fromDate, toDate } = req.body;

    const userId = req.session.user.id;

    // Find employee
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    // Calculate leave days
    const from = new Date(fromDate);
    const to = new Date(toDate);

    const diffTime = to - from;
    let numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // 🔹 Exclude Holidays from leave days
    const Holiday = require("../models/Holiday");
    const holidaysInRange = await Holiday.find({
      date: { $gte: from, $lte: to }
    });

    if (holidaysInRange.length > 0) {
      numberOfDays -= holidaysInRange.length;
    }

    if (numberOfDays <= 0) {
      return res.status(400).json({
        message: "Your leave period only consists of holidays. No leave application needed!"
      });
    }

    // Check leave balance based on type (Only for paid leaves)
    if (leaveType !== "Unpaid Leave") {
      let balance = 0;
      if (leaveType === "Sick Leave") balance = employee.sickLeave.total - employee.sickLeave.used;
      else if (leaveType === "Casual Leave") balance = employee.casualLeave.total - employee.casualLeave.used;
      else if (leaveType === "Annual Leave") balance = employee.annualLeave.total - employee.annualLeave.used;

      if (numberOfDays > balance) {
        return res.status(400).json({
          message: `Not enough ${leaveType} balance. Remaining: ${balance} days.`
        });
      }
    }

    // Handle document
    let documentPath = null;

    if (req.file) {
      documentPath = req.file.filename;
    }

    // Create leave
    const leave = new Leave({

      employeeId: employee._id,

      leaveType,

      fromDate,

      toDate,

      numberOfDays,

      document: documentPath

    });

    await leave.save();

    // Trigger notification to all Admins
    try {
      const admins = await User.find({ role: "admin" });
      const senderId = req.session.user.id;
      for (const admin of admins) {
        await sendNotification(
          admin._id,
          senderId,
          "leave_apply",
          "New Leave Application",
          `${employee.name} has applied for ${leaveType} (from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}).`
        );
      }
    } catch (notifErr) {
      console.error("FAIL TO SEND APPLY LEAVE NOTIFICATION:", notifErr);
    }

    await logAudit(req, `Applied for leave: ${leaveType} (${numberOfDays} days) starting ${new Date(fromDate).toLocaleDateString()}`, "Leave");

    res.status(201).json(leave);

  } catch (err) {

    console.error("APPLY LEAVE ERROR:", err);

    res.status(500).json({
      error: err.message
    });

  }
};



// ================= GET MY LEAVES =================

exports.getMyLeaves = async (req, res) => {
  try {

    const userId = req.session.user.id;

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const leaves = await Leave.find({
      employeeId: employee._id
    }).sort({ createdAt: -1 });

    res.status(200).json(leaves);

  } catch (err) {

    console.error("GET MY LEAVES ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};



// ================= GET ALL LEAVES =================

exports.getLeaves = async (req, res) => {
  try {

    const leaves = await Leave.find()

      .populate({
        path: "employeeId",
        populate: {
          path: "userId",
          select: "email name"
        }
      })

      .sort({ createdAt: -1 });

    res.status(200).json(leaves);

  } catch (err) {

    console.error("GET LEAVES ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};



// ================= APPROVE / REJECT =================

exports.updateLeaveStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const leave = await Leave.findById(
      req.params.id
    );

    if (!leave) {

      return res.status(404).json({
        message: "Leave not found"
      });

    }

    leave.status = status;

    await leave.save();

    // If approved → handle deduction and counts
    if (status === "approved") {
      const employee = await Employee.findById(leave.employeeId);

      // 1. Calculate Deduction (For ANY approved leave request)
      const dailyRate = employee.salary / 30;
      const deductionAmount = Math.round(dailyRate * leave.numberOfDays);
      
      leave.deduction = deductionAmount;
      await leave.save();

      // 2. Update specific leave counts (For paid leaves)
      if (leave.leaveType === "Sick Leave") {
        employee.sickLeave.used += leave.numberOfDays;
      } else if (leave.leaveType === "Casual Leave") {
        employee.casualLeave.used += leave.numberOfDays;
      } else if (leave.leaveType === "Annual Leave") {
        employee.annualLeave.used += leave.numberOfDays;
      }

      await employee.save();
    }

    // Trigger notification to Employee
    try {
      const employee = await Employee.findById(leave.employeeId);
      if (employee) {
        const notifType = status === "approved" ? "leave_approve" : "leave_reject";
        const notifTitle = `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
        const notifMessage = `Your request for ${leave.leaveType} from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been ${status}.`;
        await sendNotification(
          employee.userId,
          req.session.user.id,
          notifType,
          notifTitle,
          notifMessage
        );
      }
    } catch (notifErr) {
      console.error("FAIL TO SEND STATUS LEAVE NOTIFICATION:", notifErr);
    }

    await logAudit(req, `Leave status updated to ${status} for Employee ${employee?.name || "N/A"} (${leave.leaveType})`, "Leave");

    res.json(leave);

  } catch (err) {

    console.error(
      "UPDATE STATUS ERROR:",
      err
    );

    res.status(500).json({
      error: err.message
    });

  }
};



// ================= GET LEAVE STATS =================

exports.getLeaveStats = async (req, res) => {
  try {

    const userId = req.session.user.id;

    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const pending = await Leave.countDocuments({
      employeeId: employee._id,
      status: "pending"
    });

    const approved = await Leave.countDocuments({
      employeeId: employee._id,
      status: "approved"
    });

    const rejected = await Leave.countDocuments({
      employeeId: employee._id,
      status: "rejected"
    });

    res.status(200).json({
      pending,
      approved,
      rejected
    });

  } catch (err) {

    console.error("GET STATS ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch stats"
    });

  }
};



// ================= GET LEAVE BALANCE (NEW) =================

exports.getLeaveBalance = async (req, res) => {

  try {

    const userId = req.session.user.id;

    const employee =
      await Employee.findOne({ userId });

    if (!employee) {

      return res.status(404).json({
        message: "Employee not found"
      });

    }

    res.status(200).json({
      sickLeave: employee.sickLeave,
      casualLeave: employee.casualLeave,
      annualLeave: employee.annualLeave
    });

  } catch (err) {

    console.error(
      "GET BALANCE ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to fetch leave balance"
    });

  }

};