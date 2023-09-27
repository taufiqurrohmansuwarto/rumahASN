module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { current_role } = user;

    const admin = current_role === "admin";
    const agent = current_role === "agent";

    const adminDanAgent = admin || agent;

    if (!adminDanAgent) {
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
