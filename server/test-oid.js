const mongoose = require('mongoose');
const schema = new mongoose.Schema({ assignedTo: mongoose.Schema.Types.ObjectId });
const Model = mongoose.model('TestOid', schema);
const doc = new Model({ assignedTo: "" });
console.log(doc.validateSync());
