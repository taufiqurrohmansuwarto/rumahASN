const SiasnToken = require("@/models/siasn-instansi/siasn-token.model");
const PRAKOM_ID = process.env.PRAKOM_ID || "master|56543";

module.exports = async (req, res, next) => {
  try {
    const token = await SiasnToken.query()
      .where("user_id", PRAKOM_ID)
      .orderBy("created_at", "desc")
      .first();

    if (!token) {
      res.status(401).json({ code: 401, message: "Unauthorized" });
    } else {
      req.token = token.token.access_token;
      next();
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};
