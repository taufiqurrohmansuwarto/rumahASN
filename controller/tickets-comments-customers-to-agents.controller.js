const TicketsCommentsCustomers = require("../models/tickets_comments_customers.model");
const Tickets = require("../models/tickets.model");
const Notifications = require("../models/notifications.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;

    // more reason to filter something
    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      const result = await TicketsCommentsCustomers.query()
        .where("ticket_id", id)
        .withGraphFetched("[user(simpleSelect)]")
        .orderBy("created_at", "desc")
        .andWhere("user_id", customId);

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
    const { id, commentId } = req?.query;

    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      await TicketsCommentsCustomers.query()
        .delete()
        .where("ticket_id", id)
        .andWhere("id", commentId)
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
    const { id, commentId } = req?.query;

    const currentTicket = await Tickets.query().findById(id);

    if (currentTicket) {
      await TicketsCommentsCustomers.query()
        .patch(req.body)
        .where("id", commentId)
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

    const currentTicket = await Tickets.query().findById(id);

    // if current ticket status is not selesai dont do ever fucking this
    if (currentTicket) {
      let role;
      const assignee = currentTicket?.assignee;
      const chooser = currentTicket?.chooser;
      const requester = currentTicket?.requester;

      if (assignee === customId) {
        role = "assignee";
      } else if (chooser === customId) {
        role = "admin";
      } else if (requester === customId) {
        role = "requester";
      }

      await TicketsCommentsCustomers.query().insert({
        ticket_id: id,
        user_id: customId,
        comment: req.body.comment,
        role,
      });

      // add notifications here
      if (role === "requester") {
        await Notifications.query().insert({
          to: assignee,
          from: customId,
          type_id: id,
          type: "chats_customer_to_agent",
          content: "Mengomentari tiket anda",
          title: "Komentar",
          role: "agent",
        });
      } else if (role === "assignee") {
        await Notifications.query().insert({
          to: requester,
          from: customId,
          type_id: id,
          type: "chats_agent_to_customer",
          content: "Mengomentari tiket anda",
          title: "Komentar",
          role: "requester",
        });
      }

      res.json({ code: 200, message: "success" });
    } else {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    }
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
