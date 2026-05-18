const mongoose = require('mongoose');
const schema = new mongoose.Schema({ dueDate: Date });
const Model = mongoose.model('TestDateCreate', schema);
mongoose.connect('mongodb://127.0.0.1:27017/authDB').then(async () => {
  try {
    await Model.create({ dueDate: "" });
    console.log("Success");
  } catch (e) {
    console.log("Error:", e.message);
  }
  process.exit(0);
});
