const TicketsCommentsCustomers = require("../models/tickets-comments-customers.model");
const Tickets = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    // more reason to filter something
    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      const result = await TicketsCommentsCustomers.query()
        .where("ticket_id", id)
        .andWhere("user_id", customId)
        .first();

      res.json(result);
    } else {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id, commentCustomerId } = req?.query;

    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      await TicketsCommentsCustomers.query()
        .delete()
        .where("ticket_id", id)
        .andWhere("id", commentCustomerId)
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
  try {
    const { customId } = req?.user;
    const { id, commentCustomerId } = req?.query;

    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      await TicketsCommentsCustomers.query()
        .update(req.body)
        .where("id", commentCustomerId)
        .andWhere("user_id", customId)
        .andWhere("ticket_id", id);
      res.json({ code: 200, message: "success" });
    } else {
      res.json({ code: 404 }).json({ code: 404, message: "Ticket not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    await TicketsCommentsCustomers.query().insert({
      ticket_id: id,
      user_id: customId,
      comment: req.body.comment,
    });

    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id, commentCustomerId } = req?.query;

    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      const result = await TicketsCommentsCustomers.query()
        .where("ticket_id", id)
        .andWhere("id", commentCustomerId)
        .andWhere("user_id", customId)
        .first();
      res.json(result);
    } else {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    }
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
