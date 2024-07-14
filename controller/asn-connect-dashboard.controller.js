const Discussions = require("@/models/discussions.model");

const asnConnectDashboard = async (req, res) => {
  try {
    // get hot discussions
    const result = await Discussions.query()
      .select(
        "id",
        "title",
        "created_at as date",
        "upvote_count as upvotes",
        "downvote_count as downvotes",
        "total_comment as comments",
        "created_by"
      )
      .where("is_active", true)
      .orderBy([
        { created_at: "desc" },
        { upvote_count: "desc" },
        { total_comment: "desc" },
      ])
      .withGraphFetched("[user]")
      .limit(5);

    const data = {
      discussions: result,
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  asnConnectDashboard,
};
