const TicketAgentHelper = require("../models/tickets_agents_helper.model");

const index = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;

    const { customId } = req?.user;
    const result = await TicketAgentHelper.query()
      .where("user_custom_id", customId)
      .page(page - 1, limit);

    res.json({
      data: result.results,
      total: result.total,
      limit,
      page,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error" });
  }
};

const create = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error" });
  }
};

const update = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error" });
  }
};

const remove = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error" });
  }
};

module.exports = {
  index,
  create,
  detail,
  update,
  remove,
};
