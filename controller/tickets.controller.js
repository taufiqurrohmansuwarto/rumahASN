const UserHistory = require("@/models/users-histories.model");
const Tickets = require("../models/tickets.model");
const TicketHistories = require("@/models/tickets_histories.model");

module.exports.userTicket = async (req, res) => {
  try {
    const { id: userId } = req?.query;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const currentTicket = await Tickets.query()
      .select("id", "title", "created_at")
      .andWhere("requester", userId)
      .page(page - 1, limit)
      .orderBy("created_at", "desc");

    const data = {
      page,
      limit,
      result: currentTicket.results,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports.index = async (req, res) => {
  const { current_role } = req?.user;
  try {
    if (current_role === "admin") {
      const result = await Tickets.query().orderBy("id", "desc");
      res.json(result);
    } else if (current_role === "user") {
      const result = await Tickets.query()
        .where("user_id", req.user.userId)
        .orderBy("id", "desc");
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.remove = async (req, res) => {
  const { current_role, userId } = req?.user;
  const { id } = req?.query;
  try {
    if (current_role === "admin") {
      await UserHistory.query().delete().where("ticket_id", id);
      await TicketHistories.query().delete().where("ticket_id", id);
      await Tickets.query().deleteById(id);
      res.json({ code: 200, message: "success" });
    } else if (current_role === "user") {
      const result = await Tickets.query()
        .delete()
        .where("id", id)
        .andWhere("user_id", userId);
      res.json(result);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.update = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.create = async (req, res) => {
  try {
    await Tickets.query().insert({
      title: req.body.title,
      description: req.body.description,
      content: req.body.content,
      user_id: req.user.userId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
