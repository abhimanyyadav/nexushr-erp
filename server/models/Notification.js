const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true // User who receives the notification
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // User who triggered the action (e.g., employee or admin)
  },
  type: {
    type: String,
    enum: ["leave_apply", "leave_approve", "leave_reject", "task_assign", "system"],
    default: "system"
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
