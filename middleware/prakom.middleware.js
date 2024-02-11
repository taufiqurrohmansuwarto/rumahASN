module.exports = async (req, res, next) => {
  const currentUser = req.user;
  const prakomId = "master|56543";

  if (currentUser?.customId === prakomId) {
    next();
  } else {
    res.status(403).json({ code: 403, message: "Forbidden" });
  }
};
