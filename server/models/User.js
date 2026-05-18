const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/]
  },

  password: {
    type: String,
    required: true
  },
profilePic: {
  type: String,
  default: ""
},
  role: {
    type: String,
    enum: ["admin", "employee", "manager", "hr"],
    default: "employee"
  },

  resetToken: String,
  resetTokenExpiry: Date
});


module.exports = mongoose.model("User", userSchema);