const Tickets = require("../models/tickets.model");

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await Tickets.query()
      .findById(id)
      .withGraphFetched(
        "[status, priorities, categories, agent(simpleSelect), customer(simpleSelect), admin(simpleSelect)]"
      );
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
      .patch({
        chooser: customId,
        chooser_picked_at: new Date(),
        assignee: body?.assignee,
      })
      .where("id", id)
      .andWhere("status_code", "DIAJUKAN");

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
      .patch({
        chooser: null,
        chooser_picked_at: null,
        assignee: null,
        assignee_json: null,
      })
      .where("id", id)
      .andWhere("status_code", "DIAJUKAN");
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
