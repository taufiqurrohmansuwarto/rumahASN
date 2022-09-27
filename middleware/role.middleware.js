const checkingMiddleware = (role) => {
  return (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      res.status(403).json({ code: 403, message: "Forbidden" });
    }
  };
};
