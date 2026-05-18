const mongoose = require('mongoose');
const Task = require('./models/Task');

mongoose.connect('mongodb://127.0.0.1:27017/authDB')
  .then(async () => {
    try {
      const task = await Task.create({
        title: "Test Task from Script",
        description: "Testing",
        assignedTo: "6a08c4e101fd5fa3407caea8",
        assignedBy: "6a08c4e101fd5fa3407caea6",
        dueDate: ""
      });
      console.log("Success! Task ID:", task._id);
    } catch(err) {
      console.log("Error:", err.message);
    }
    process.exit(0);
  });
