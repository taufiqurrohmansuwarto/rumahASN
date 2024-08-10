module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { role, group } = user;

    const asn = role === "USER" && group === "MASTER";
    const nonAsn = role === "USER" && group === "PTTPK";
    const fasilitator = group === "MASTER" && role === "FASILITATOR";

    const asnNonAsnFasilitator = asn || nonAsn || fasilitator;

    if (!asnNonAsnFasilitator) {
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
