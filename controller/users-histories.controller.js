const UserHistory = require("@/models/users-histories.model");

const getUsersHistories = async (req, res) => {
  try {
    const { user } = req;
    const { userId } = user;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const result = await UserHistory.query()
      .where("user_id", userId)
      .page(page - 1, limit)
      .orderBy("created_at", "desc");

    const data = {
      result: result.results,
      pagination: {
        total: result.total,
        limit: result.limit,
        page: result.page,
      },
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
