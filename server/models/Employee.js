const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  department: {
    type: String
  },

  salary: {
    type: Number
  },

  bonus: {
    type: Number
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  employeeId: {
    type: String,
    unique: true
  },

  joiningDate: {
    type: Date,
    default: Date.now
  },

  phone: {
    type: String
  },

  address: {
    type: String
  },

  // NEW FIELDS FOR LEAVE SYSTEM (Updated)
  sickLeave: {
    total: { type: Number, default: 5 },
    used: { type: Number, default: 0 }
  },
  casualLeave: {
    total: { type: Number, default: 5 },
    used: { type: Number, default: 0 }
  },
  annualLeave: {
    total: { type: Number, default: 10 },
    used: { type: Number, default: 0 }
  }

});

module.exports = mongoose.model("Employee", employeeSchema);