const Tickets = require("../models/tickets.model");

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await Tickets.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const addAgents = async (req, res) => {
  try {
    const { id } = req?.query;
    const { body } = req;
    const { customId } = req?.user;

    await Tickets.query()
      .update({
        chooser: customId,
        chooser_picked_at: new Date(),
        assignee: body?.assignee,
        assignee_json: body?.assignee_json,
      })
      .where("id", id);

    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const removeAgents = async (req, res) => {
  try {
    const { id } = req?.query;
    await Tickets.query()
      .update({
        chooser: null,
        chooser_picked_at: null,
        assignee: null,
        assignee_json: null,
      })
      .where("id", id);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Errorj" });
  }
};

module.exports = {
  addAgents,
  removeAgents,
  detail,
};
