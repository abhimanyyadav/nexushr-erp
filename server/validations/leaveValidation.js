const Joi = require("joi");

const applyLeaveSchema = Joi.object({
  leaveType: Joi.string().valid("Sick", "Casual", "Paid").required(),
  fromDate: Joi.date().required(),
  toDate: Joi.date().required()
});

const updateLeaveStatusSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").required()
});

module.exports = { applyLeaveSchema, updateLeaveStatusSchema };