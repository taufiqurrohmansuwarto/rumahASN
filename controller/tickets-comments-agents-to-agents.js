const TicketsCommentsAgents = require("../models/tickets_comments_agents.model");
const Ticktes = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    // hanya boleh mengambil id
    const currentTicket = await Ticktes.query()
      .where("id", id)
      /**!fix this motherfucker */
      // .andWhere("requester", customId)
      // .andWhere("status", "DIKERJAKAN")
      .first();

    if (!currentTicket) {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    } else {
      const result = await TicketsCommentsAgents.query()
        .where("ticket_id", currentTicket?.id)
        .withGraphFetched("[user(simpleSelect)]")
        .orderBy("created_at", "desc");
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  const { id, commentAgentId } = req?.query;
  const { customId } = req?.user;

  try {
    const currentTicket = await Ticktes.query()
      .where("id", id)
      // .andWhere("requester", customId)
      // .andWhere("status", "DIKERJAKAN")
      .first();

    if (currentTicket) {
      await TicketsCommentsAgents.query()
        .delete()
        .where("ticket_id", id)
        .andWhere("id", commentAgentId)
        .andWhere("user_id", customId);

      res.json({ code: 200, message: "success" });
    } else {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  const { id, commentAgentId } = req?.query;
  const { customId } = req?.user;

  try {
    // must be validation
    await TicketsCommentsAgents.query()
      .update(req?.body)
      .where("ticket_id", id)
      .andWhere("id", commentAgentId)
      .andWhere("user_id", customId);

    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const result = await TicketsCommentsAgents.query()
      .insert({
        ...req?.body,
        ticket_id: id,
        user_id: customId,
      })
      .returning("*")
      .first();

    res.json({ code: 200, message: "success", data: result });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
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
