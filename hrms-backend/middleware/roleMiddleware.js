/**
 * Restricts a route to specific roles.
 * Usage: router.get('/all', protect, requireRole('admin'), controllerFn)
 * @param  {...string} roles - allowed roles, e.g. 'admin', 'employee'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = { requireRole };
