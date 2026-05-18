const isAdmin = (req, res, next) => {
  const role = req.session.user?.role;
  if (role !== "admin") {
    return res.status(403).json({
      message: `Access denied - Admin only (Your session changed to: ${role}. Did you log in to another account in a different tab?)`
    });
  }
  next();
};

module.exports = isAdmin;