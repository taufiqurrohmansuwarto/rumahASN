const Notifications = require("../models/notifications.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await Notifications.query()
      .where("to", customId)
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
