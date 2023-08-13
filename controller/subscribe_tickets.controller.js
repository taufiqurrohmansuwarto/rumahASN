const TicketsSubscription = require("@/models/tickets_subscriptions.model");

const subscribeList = async (req, res) => {
  try {
    const { user } = req;
    const { customId: userId } = user;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const result = await TicketsSubscription.query()
      .where("user_id", userId)
      .withGraphFetched("[ticket(simple)]")
      .page(parseInt(page) - 1, parseInt(limit));

    const data = {
      page,
      limit,
      total: result.total,
      data: result.results,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  subscribeList,
};
