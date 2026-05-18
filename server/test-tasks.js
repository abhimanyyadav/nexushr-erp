const mongoose = require('mongoose');
const Task = require('./models/Task');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/authDB')
  .then(async () => {
    const tasks = await Task.find({});
    console.log("Tasks in DB:", JSON.stringify(tasks, null, 2));

    const users = await User.find({}, 'name role _id');
    console.log("\nUsers in DB:", JSON.stringify(users, null, 2));

    process.exit(0);
  });
