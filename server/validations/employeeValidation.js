const Joi = require("joi");

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  department: Joi.string().min(2).max(50).required(),
  salary: Joi.number().min(0).required(),
  bonus: Joi.number().min(0).required(),
  userId: Joi.string().required()  // link to user
});

module.exports = { createEmployeeSchema };