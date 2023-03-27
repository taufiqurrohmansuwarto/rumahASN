const Notifications = require("../models/notifications.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const limit = req?.query?.limit || 10;
    const page = req?.query?.page || 1;
    const simbol = req?.query?.symbol || "no";

    if (simbol === "no") {
      const result = await Notifications.query()
        .where("to", customId)
        .withGraphFetched("[from_user(simpleSelect) ]")
        .page(parseInt(page) - 1, parseInt(limit))
        .orderBy("created_at", "desc");
      res.json(result);
    } else if (simbol === "yes") {
      const result = await Notifications.query()
        .count()
        .where("to", customId)
        .andWhere("read_at", null);
      res.json(result[0]);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// clear chats
const clearChats = async (req, res) => {
  try {
    const { customId } = req?.user;
    await Notifications.query()
      .patch({ read_at: new Date() })
      .where("to", customId)
      .andWhere("read_at", null);
    res.status(200).json({ code: 200, message: "success" });
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
  clearChats,
  remove,
};
