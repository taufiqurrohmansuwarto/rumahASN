module.exports = (req, res, next) => {
  const { user } = req;
  if (user?.is_consultant) {
    next();
  } else {
    res.status(403).json({ code: 403, message: "Forbidden" });
  }
};
