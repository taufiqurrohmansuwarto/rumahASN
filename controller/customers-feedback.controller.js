const Tickets = require("../models/tickets.model");
const Notifications = require("../models/notifications.model");

const addFeedback = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;
    const { body } = req;

    // check first
    const currentTicket = await Tickets.query()
      .where("id", id)
      .andWhere("requester", customId)
      .andWhere("status_code", "SELESAI")
      .first();

    if (currentTicket) {
      await Tickets.query()
        .update({
          stars: body.stars,
          requester_comment: body.requester_comment,
          has_feedback: true,
        })
        .where("id", id)
        .andWhere("requester", customId)
        .andWhere("status_code", "SELESAI")
        // .andWhere("has_feedback", false)
        .first();

      await Notifications.query().insert({
        to: currentTicket.assignee,
        from: customId,
        type_id: id,
        type: "feedback",
        title: "Feedback",
        content: "Memberikan feedback",
        role: "agent",
      });

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
