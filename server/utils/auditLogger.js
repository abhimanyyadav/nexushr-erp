const AuditLog = require("../models/AuditLog");

/**
 * Helper to log critical enterprise actions in the background.
 * @param {Object} req Express request object (contains session user)
 * @param {String} action Human-readable action description
 * @param {String} category Log category ("Auth", "Leave", "Task", "Employee", "System")
 * @param {Object} [details] Optional detailed metadata
 */
exports.logAudit = async (req, action, category = "System", details = null) => {
  try {
    if (!req.session || !req.session.user) {
      console.warn("AUDIT LOGGER SKIPPED: No active user session.");
      return;
    }

    const actorId = req.session.user.id;
    const actorName = req.session.user.email; // Can fall back or resolve to name later
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

    const log = new AuditLog({
      actor: actorId,
      actorName,
      action,
      category,
      ipAddress,
      details
    });

    await log.save();
  } catch (err) {
    console.error("AUDIT LOGGING FAILURE:", err);
  }
};
