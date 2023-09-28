module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { current_role } = user;

    const petugas = current_role === "agent" || current_role === "admin";

    if (!petugas) {
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
