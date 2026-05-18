const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ["Reserved", "Unreserved"],
    default: "Reserved"
  }
}, { timestamps: true });

module.exports = mongoose.model("Holiday", holidaySchema);
