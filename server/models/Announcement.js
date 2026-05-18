const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["General", "Holiday", "Policy", "Event"],
    default: "General"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
