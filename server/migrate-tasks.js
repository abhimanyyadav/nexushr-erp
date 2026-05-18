const mongoose = require('mongoose');
const Task = require('./models/Task');

mongoose.connect('mongodb://127.0.0.1:27017/authDB')
  .then(async () => {
    try {
      await Task.updateMany({ status: "pending" }, { $set: { status: "Pending" } });
      await Task.updateMany({ status: "in-progress" }, { $set: { status: "In Progress" } });
      await Task.updateMany({ status: "completed" }, { $set: { status: "Completed" } });
      
      const tasks = await Task.find({});
      console.log("Migration complete. Tasks:", tasks.map(t => t.status));
    } catch(err) {
      console.log("Error:", err.message);
    }
    process.exit(0);
  });
