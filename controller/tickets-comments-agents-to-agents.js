const TicketsCommentsAgents = require("../models/tickets_comments_agents.model");
const Ticktes = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // hanya boleh mengambil id
    const currentTicket = await Ticktes.query()
      .where("id", id)
      .andWhere("requester", customId)
      .andWhere("status", "DIKERJAKAN")
      .first();

    if (!currentTicket) {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    } else {
      const result = await TicketsCommentsAgents.query()
        .where("id", currentTicket?.id)
        .orderBy("created_at", "desc");
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  const { id } = req?.query;
  const { customId } = req?.user;

  try {
    //   always check first
    const currentTicket = await Ticktes.query()
      .where("id", id)
      .andWhere("requester", customId)
      .andWhere("status", "DIKERJAKAN")
      .first();

    if (currentTicket) {
      const result = await TicketsCommentsAgents.query()
        .delete()
        .where("ticket_id", id);
      res.json(result);
    } else {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  const { id } = req?.query;
  const { customId } = req?.user;
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  const { id } = req?.query;
  const { customId } = req?.user;
  try {
    error;
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  remove,
  update,
  create,
  detail,
};
