const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.current_role === role) {
      next();
    } else {
      res.status(403).json({ code: 403, message: "Forbidden" });
    }
  };
};

module.exports = checkRole;
