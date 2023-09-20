module.exports = async (req, res, next) => {
  try {
    const user = req.user;
    const { group } = user;

    if (group === "GOOGLE") {
      next();
    } else {
      res.status(403).json({ code: 403, message: "Forbidden" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
