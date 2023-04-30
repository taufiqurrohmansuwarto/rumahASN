const User = require("@/models/users.model");

module.exports.getOwnProfile = async (req, res) => {
  try {
    const { customId: userId, current_role } = req.user;
    const result = await User.query()
      .where("custom_id", userId)
      .first()
      .select("image", "current_role", "about_me", "username");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.updateOwnProfile = async (req, res) => {
  try {
    const { customId: userId } = req.user;

    const { about_me } = req.body;

    await User.query()
      .patch({
        about_me,
      })
      .where("custom_id", userId);

    res.json({
      code: 200,
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.detailUserProfile = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await User.query()
      .where("custom_id", id)
      .first()
      .select("username", "image", "about_me", "group");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
