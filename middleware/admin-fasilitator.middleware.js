module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { current_role, group, role } = user;

    const currentGroup = group === "MASTER" || group === "PTTPK";

    const admin = current_role === "admin" && currentGroup;
    const masterFasilitator = role === "FASILITATOR" && group === "MASTER";

    const adminDanFasilitator = admin || masterFasilitator;

    if (!adminDanFasilitator) {
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
