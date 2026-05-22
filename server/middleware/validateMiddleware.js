// middleware/validateMiddleware.js

module.exports = (schema) => {
  return (req, res, next) => {
    try {
      // 🔹 Ensure body exists (important for multer/form-data)
      const data = req.body || {};

      // 🔹 Validate using Joi
      const { error, value } = schema.validate(data, {
        abortEarly: false,   // show all errors
        allowUnknown: true   // ignore extra fields like file
      });

      // 🔹 If validation fails
      if (error) {
        console.log("Validation failed details:", error.details.map(err => err.message));
        return res.status(400).json({
          message: error.details.map(err => err.message).join(", ")
        });
      }

      // 🔹 Replace req.body with validated data (clean)
      req.body = value;

      next();
    } catch (err) {
      console.error("VALIDATION ERROR:", err);
      return res.status(500).json({
        message: "Validation middleware error"
      });
    }
  };
};