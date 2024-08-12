module.exports = (req, res, next) => {
  const { user } = req;

  const group = user?.group;
  const role = user?.role;

  const fasilitatorMaster = group === "FASILITATOR" && role === "MASTER";

  if (user?.is_consultant || fasilitatorMaster) {
    next();
  } else {
    res.status(403).json({ code: 403, message: "Forbidden" });
  }
};
