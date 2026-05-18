const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true // User who performed the action
  },
  actorName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true // Description of action (e.g. "Approved leave request for Akbar Shah")
  },
  category: {
    type: String,
    enum: ["Auth", "Leave", "Task", "Employee", "System"],
    default: "System"
  },
  ipAddress: {
    type: String,
    default: "127.0.0.1"
  },
  details: {
    type: mongoose.Schema.Types.Mixed // Optional raw details
  }
}, { timestamps: true });

module.exports = mongoose.model("AuditLog", auditLogSchema);
