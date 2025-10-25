module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ code: 401, message: "Unauthorized" });
    }

    const { current_role, group, organization_id } = user;

    const currentGroup = group === "MASTER" || group === "PTTPK";
    const asn = group === "MASTER";

    const admin = current_role === "admin" && currentGroup;
    const kominfo = organization_id?.startsWith("107") && asn;

    if (!admin && !kominfo) {
      return res.status(403).json({ code: 403, message: "Forbidden" });
    }

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
