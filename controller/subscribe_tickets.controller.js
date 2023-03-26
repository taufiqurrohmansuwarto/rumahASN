const Tickets = require("../models/tickets.model");

const list = async (req, res) => {
  try {
    const { id: userId } = req.params;

    //     find all tickets that the user is subscribed to
    const result = await Tickets.query()
      .select("tickets.*")
      .withGraphJoined("subscriptions")
      .where("subscriptions.user_id", userId);

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  list,
};
