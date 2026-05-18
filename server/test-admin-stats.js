const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/authDB').then(async () => {
  const Employee = require('./models/Employee');
  const Leave = require('./models/Leave');
  const Task = require('./models/Task');
  
  const emp = await Employee.countDocuments();
  const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
  const activeTasks = await Task.countDocuments({ status: { $in: ["Pending", "In Progress"] } });
  
  console.log(`Employees: ${emp}, Leaves: ${pendingLeaves}, Tasks: ${activeTasks}`);
  process.exit(0);
});
