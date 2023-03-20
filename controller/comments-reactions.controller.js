const Reactions = require("@/models/comments-reactions.model");
const addCommentsReactions = async (req, res) => {
  try {
    const { commentId, id } = req.query;
    const {
      user: { custom_id: userId },
    } = req;

    await Reactions.query()
      .delete()
      .where({ comment_id: commentId, user_id: id });

    await Reactions.query().insert({
      comment_id: commentId,
      user_id: userId,
      reaction: req.body.reaction,
    });

    res.status(200).json({ message: "Success" });
    //     delete req.query.commentId;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addCommentsReactions,
};
