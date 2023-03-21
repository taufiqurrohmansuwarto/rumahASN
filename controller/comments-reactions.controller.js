const Reactions = require("@/models/comments-reactions.model");
const addCommentsReactions = async (req, res) => {
  try {
    const { commentId } = req.query;
    const {
      user: { customId: userId },
    } = req;

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

const removeCommentsReactions = async (req, res) => {
  try {
    const { commentId } = req.query;
    const {
      user: { customId: userId },
    } = req;

    await Reactions.query().delete().where({
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
  removeCommentsReactions,
};
