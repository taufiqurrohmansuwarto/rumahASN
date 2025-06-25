module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { role, group, status_kepegawaian } = user;

    const asn =
      status_kepegawaian === "PNS" ||
      status_kepegawaian === "PPPK" ||
      status_kepegawaian === "CPNS";

    if (!asn) {
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
