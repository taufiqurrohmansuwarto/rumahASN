const Tickets = require("../models/tickets.model");

const addFeedback = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customid } = req?.user;
    const { body } = req;

    // check first
    const currentTicket = await Tickets.query()
      .where("id", id)
      .andWhere("requester", customid)
      .andWhere("status", "SELESAI")
      .first();

    if (currentTicket) {
      await Tickets.query()
        .update({
          stars: body.stars,
          requester_comment: body.requester_comment,
        })
        .where("id", id)
        .andWhere("requester", customid)
        .andWhere("status", "SELESAI")
        .first();

      res.status(200).json({ code: 200, message: "success" });
    } else {
      res.status(404).json({ code: 404, message: "Ticket not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  addFeedback,
};
