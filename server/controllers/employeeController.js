const Employee = require("../models/Employee");

// ================= CREATE EMPLOYEE =================
exports.createEmployee = async (req, res) => {
  try {
    const { name, email, department, salary, bonus, employeeId, joiningDate, phone, address } = req.body;

    // validation
    if (!name || !email) {
      return res.status(400).json({
        message: "Name and Email are required"
      });
    }

    // ✅ Auto-generate Employee ID if not provided
    let finalEmployeeId = employeeId;
    if (!finalEmployeeId) {
      const count = await Employee.countDocuments();
      finalEmployeeId = `EMP-${(count + 1).toString().padStart(3, '0')}`;
    }

    // ✅ handle image
    const profilePic = req.file ? req.file.filename : "";

    const employee = await Employee.create({
      name,
      department: department || "Not Assigned",
      salary: salary || 0,
      bonus: bonus || 0,
      employeeId: finalEmployeeId,
      joiningDate: joiningDate || Date.now(),
      phone,
      address,
      profilePic
    });

    res.status(201).json({
      message: "Employee created successfully",
      employee: {
        ...employee._doc,
        profilePic: profilePic
          ? `http://localhost:8080/uploads/${profilePic}`
          : ""
      }
    });

  } catch (err) {
    console.error("CREATE EMPLOYEE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const Leave = require("../models/Leave");

// ================= GET EMPLOYEES =================
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "email role");

    // ✅ attach image URL and total deductions
    const updatedEmployees = await Promise.all(employees.map(async emp => {
      const leaves = await Leave.find({ employeeId: emp._id, status: "approved" });
      const totalDeduction = leaves.reduce((sum, leave) => {
        const deductionAmount = leave.deduction || Math.round((emp.salary / 30) * (leave.numberOfDays || 1));
        return sum + deductionAmount;
      }, 0);

      return {
        ...emp._doc,
        totalDeduction,
        profilePic: emp.profilePic
          ? `http://localhost:8080/uploads/${emp.profilePic}`
          : ""
      };
    }));

    res.status(200).json(updatedEmployees);

  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE EMPLOYEE =================
exports.updateEmployee = async (req, res) => {
  try {
    const { department, salary, bonus, phone, address } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        department,
        salary,
        bonus,
        phone,
        address
      },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      employee
    });

  } catch (err) {
    console.error("UPDATE EMPLOYEE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE EMPLOYEE =================
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee deleted successfully"
    });

  } catch (err) {
    console.error("DELETE EMPLOYEE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};