const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },

  leaveType: {
    type: String,
    enum: ["Sick Leave", "Casual Leave", "Annual Leave", "Unpaid Leave"],
    required: true
  },

  fromDate: {
    type: Date,
    required: true
  },

  toDate: {
    type: Date,
    required: true
  },

  // NEW FIELD
  numberOfDays: {
    type: Number
  },

  // SALARY DEDUCTION
  deduction: {
    type: Number,
    default: 0
  },

  // DOCUMENT PROOF
  document: {
    type: String
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);