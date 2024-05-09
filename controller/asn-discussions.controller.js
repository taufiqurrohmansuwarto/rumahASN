const Discussion = require("@/models/discussions.model");
const DiscussionVote = require("@/models/discussion-votes.model");
const { transaction } = require("objection");

const toggleVote = async (discussionId, userId, voteType) => {
  const trx = await transaction.start(Discussion.knex());
  try {
    const existingVote = await DiscussionVote.query(trx)
      .where({
        discussion_id: discussionId,
        user_id: userId,
      })
      .first();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same type again (toggle off)
        await DiscussionVote.query(trx).delete().where({ id: existingVote.id });
        const updateColumn =
          voteType === "upvote" ? "upvote_count" : "downvote_count";
        await Discussion.query(trx)
          .findById(discussionId)
          .decrement(updateColumn, 1);
      } else {
        // If the existing vote is of the opposite type, remove it and adjust the counts accordingly
        await DiscussionVote.query(trx).delete().where({ id: existingVote.id });
        await Discussion.query(trx)
          .findById(discussionId)
          .decrement(
            existingVote.vote_type === "upvote"
              ? "upvote_count"
              : "downvote_count",
            1
          );

        // No incrementing the opposite, as we want to reach a neutral state
      }
    } else {
      // Insert new vote and increment the corresponding vote count
      await DiscussionVote.query(trx).insert({
        discussion_id: discussionId,
        user_id: userId,
        vote_type: voteType,
      });
      const updateColumn =
        voteType === "upvote" ? "upvote_count" : "downvote_count";
      await Discussion.query(trx)
        .findById(discussionId)
        .increment(updateColumn, 1);
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

// start from here
const getDisccusions = async (req, res) => {
  try {
    const limit = req.query.limit || 25;
    const page = req.query.page || 1;

    const result = await Discussion.query()
      .select(
        "*",
        Discussion.relatedQuery("discussion")
          .where("type", "comment")
          .count()
          .as("comment_count")
      )
      .where("type", "discussion")
      .where("is_active", true)
      .withGraphFetched("[user(simpleSelect),votes(whereUserId)]")
      .modifiers({
        whereUserId: (query, userId) => {
          query.where("user_id", req?.user?.customId);
        },
      })
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: result.results,
      pagination: {
        total: result.total,
        limit: result.results.length,
        page: page,
      },
    };
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.query;
    const result = await Discussion.query()
      .findById(discussionId)
      .select(
        "*",
        Discussion.relatedQuery("discussion")
          .where("type", "comment")
          .count()
          .as("comment_count")
      )
      .where("type", "discussion")
      .where("is_active", true)
      .withGraphFetched("[user(simpleSelect),votes(whereUserId)]")
      .modifiers({
        whereUserId: (query, userId) => {
          query.where("user_id", req?.user?.customId);
        },
      });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const body = req.body;
    const { customId } = req?.user;

    const payload = {
      ...body,
      created_by: customId,
      type: "discussion",
    };

    await Discussion.query().insert(payload);
    res.json({ message: "Discussion created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.query;
    const body = req.body;
    await Discussion.query().patch(body).where({ id: discussionId });
    res.json({ message: "Discussion updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.query;
    await Discussion.query()
      .patch({ is_active: false })
      .where({ id: discussionId });

    await DiscussionVote.query()
      .delete()
      .where({ discussion_id: discussionId });
    res.json({ message: "Discussion deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const upvoteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.query;
    const { customId } = req?.user;

    await toggleVote(discussionId, customId, "upvote");

    res.json({ message: "Discussion upvoted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const downvoteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.query;
    const { customId } = req?.user;
    await toggleVote(discussionId, customId, "downvote");
    res.json({ message: "Discussion downvoted successfully" });
  } catch (error) {
    console.log(error);
  }
};

// comments
const getComments = async (req, res) => {
  try {
    const { discussionId } = req.query;
    const limit = req.query.limit || 25;
    const page = req.query.page || 1;

    const result = await Discussion.query()
      .where("type", "comment")
      .where("is_active", true)
      .where("discussion_id", discussionId)
      .withGraphFetched("[user,votes]")
      .page(page - 1, limit);

    const data = {
      data: result.results,
      pagination: {
        total: result.total,
        limit: result.results.length,
        page: page,
      },
    };
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getComment = async (req, res) => {
  try {
    const { commentId, discussionId } = req.query;
    const result = await Discussion.query()
      .findById(commentId)
      .where({ id: discussionId });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createComment = async (req, res) => {
  try {
    const body = req.body;
    const { customId } = req?.user;
    const { discussionId } = req.query;

    const payload = {
      ...body,
      discussion_id: discussionId,
      created_by: customId,
      type: "comment",
    };

    await Discussion.query().insert(payload);
    res.json({ message: "Comment created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId, discussionId } = req.query;
    const body = req.body;
    await Discussion.query()
      .patch(body)
      .where({ id: commentId })
      .where("type", "comment")
      .where("discussion_id", discussionId);

    res.json({ message: "Comment updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId, discussionId } = req.query;

    await Discussion.query()
      .patch({ is_active: false })
      .where({ id: commentId })
      .where("discussion_id", discussionId)
      .where("type", "comment");

    await DiscussionVote.query().delete().where({ discussion_id: commentId });
    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const upvoteComment = async (req, res) => {
  try {
    const { commentId } = req.query;
    const { customId } = req?.user;

    await toggleVote(commentId, customId, "upvote");

    res.json({ message: "Comment upvoted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const downvoteComment = async (req, res) => {
  try {
    const { commentId } = req.query;
    const { customId } = req?.user;
    await toggleVote(commentId, customId, "downvote");
    res.json({ message: "Comment downvoted successfully" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getDisccusions,
  createDiscussion,
  upvoteDiscussion,
  downvoteDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
  getComment,
  getDiscussion,
};
