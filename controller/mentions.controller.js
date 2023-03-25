const User = require("@/models/users.model");
const Ticket = require("@/models/tickets.model");

const usersMentions = async (req, res) => {
  try {
    const { current_role: role } = req?.user;

    const currentUser = role === "admin" || role === "agent";
    if (!currentUser) {
      res.status(403).json({ message: "Forbidden" });
    } else {
      const result = await User.query()
        .select("custom_id as identifiers", "username as description")
        .where("current_role", "agent")
        .orWhere("current_role", "admin");
      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ticketsMentions = async (req, res) => {
  try {
    const { ticketNumber } = req?.query;
    const result = await Ticket.query()
      .select("id", "title as titleText", "title as titleHtml")
      .where((builder) => {
        if (ticketNumber)
          builder.where("ticket_number", "=", `%${ticketNumber}%`);
      })
      .orderBy("created_at", "desc")
      .limit(10);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  usersMentions,
  ticketsMentions,
};
