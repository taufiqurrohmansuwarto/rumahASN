const UserHistory = require("@/models/users-histories.model");

const getUsersHistories = async (req, res) => {
  try {
    const userId = req?.user?.customId;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const result = await UserHistory.query()
      .where("user_id", userId)
      .page(page - 1, limit)
      .withGraphFetched("[ticket(simple)]")
      .orderBy("created_at", "desc");

    const nextPage = await UserHistory.query()
      .where("user_id", userId)
      .offset(page * limit)
      .limit(limit + 1);

    const data = {
      page,
      limit,
      result: result.results,
      hasNextPage: nextPage.length > 0,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUsersHistories,
};
