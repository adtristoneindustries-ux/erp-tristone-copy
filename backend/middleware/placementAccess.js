// Middleware to check if staff has placement access
const checkPlacementAccess = (req, res, next) => {
  // Admin always has access
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Students always have access to view drives and apply
  if (req.user.role === 'student') {
    return next();
  }
  
  // Staff must have hasPlacementAccess flag
  if (req.user.role === 'staff' || req.user.role === 'librarian' || req.user.role === 'canteen') {
    if (!req.user.hasPlacementAccess) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to access the placement module. Please contact the administrator.' 
      });
    }
    return next();
  }
  
  // Default deny
  return res.status(403).json({ message: 'Access denied' });
};

module.exports = { checkPlacementAccess };
