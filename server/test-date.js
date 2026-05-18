const mongoose = require('mongoose');
const schema = new mongoose.Schema({ dueDate: Date });
const Model = mongoose.model('TestDate', schema);
const doc = new Model({ dueDate: "" });
console.log(doc.validateSync());
