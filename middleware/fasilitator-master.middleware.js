module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { role, group } = user;

    const fasilitator = role === "FASILITATOR" && group === "MASTER";
    if (!fasilitator) {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
