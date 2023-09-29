module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { current_role, group, role } = user;

    const currentGroup = group === "MASTER" || group === "PTTPK";
    const fasilitator = group === "MASTER" && role === "FASILITATOR";
    const asn = group === "MASTER" && role === "USER";

    const admin = current_role === "admin" && currentGroup;

    const adminDanFasilitator = admin || fasilitator || asn;

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
