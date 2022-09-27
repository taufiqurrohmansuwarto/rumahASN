const User = require("../models/users.model");

module.exports.index = async (req, res) => {
  try {
    const users = await User.query();
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
