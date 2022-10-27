const Notifications = require("../models/notifications.model");

const index = async (req, res) => {
  try {
    const { customId, current_role } = req?.user;

    let findRole;
    if (current_role === "user") {
      findRole = ["requester"];
    } else if (current_role === "agent") {
      findRole = ["assignee", "requester"];
    } else if (current_role === "admin") {
      findRole = ["admin", "assignee", "requester"];
    }

    const result = await Notifications.query()
      .where("to", customId)
      .andWhere("role", "in", findRole)
      .orderBy("created_at", "desc");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const { customId } = req?.user;
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.statsu(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
  update,
  remove,
};
