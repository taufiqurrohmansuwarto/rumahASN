const Users = require("../models/users.model");

const index = async (req, res) => {
  try {
    const result = await Users.query()
      .where("current_role", "agent")
      .orWhere("current_role", "admin");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
};
