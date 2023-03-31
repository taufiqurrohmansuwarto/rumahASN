const Users = require("@/models/users.model");
const Categories = require("@/models/sub-categories.model");
const Priorities = require("@/models/priorities.model");
const Status = require("@/models/status.model");

const agents = async (req, res) => {
  try {
    const { current_role: role } = req?.user;

    if (role !== "admin") {
      res.status(403).json({ message: "Forbidden", code: 403 });
    } else {
      const result = await Users.query()
        .select(
          "custom_id",
          "username",
          "current_role",
          "image",
          "custom_id as value",
          "username as label"
        )
        .where("current_role", "agent")
        .orWhere("current_role", "admin");
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

const categories = async (req, res) => {
  try {
    const result = await Categories.query().withGraphFetched("category");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

const priorities = async (req, res) => {
  try {
    const result = await Priorities.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

const status = async (req, res) => {
  try {
    const result = await Status.query();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

module.exports = {
  agents,
  categories,
  priorities,
  status,
};
