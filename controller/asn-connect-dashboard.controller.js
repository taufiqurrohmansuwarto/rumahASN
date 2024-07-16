const Discussions = require("@/models/discussions.model");
const CCMeetings = require("@/models/cc_meetings.model");

const serialize = (data) => {
  return {
    id: data.id,
    title: data.title,
    date: data.created_at,
    upvotes: data.upvotes,
    downvotes: data.downvotes,
    comments: data.comments,
    author: data.user.username,
    avatar: data.user.image,
  };
};

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
      .orderBy("total_comment", "asc")
      .where("is_active", true)
      .withGraphFetched("[user]")
      .limit(5);

    const data = {
      discussions: result?.length ? result?.map(serialize) : [],
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  asnConnectDashboard,
};
