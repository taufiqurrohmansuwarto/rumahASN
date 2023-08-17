const Discussion = require("@/models/discussions.model");

module.exports.createThread = async (req, res) => {
  try {
    const {
      user: { customId },
    } = req;

    const result = await Discussion.create({
      ...req.body,
      type: "thread",
      created_by: customId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.updateThread = async (req, res) => {
  try {
    const {
      user: { customId },
    } = req;

    const result = await Discussion.query()
      .patch({
        ...req.body,
        created_by: customId,
      })
      .where("id", req?.query?.id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getThreads = async (req, res) => {
  try {
    const limit = req?.query?.limit || 10;
    const page = req?.query?.page || 1;

    const result = await Discussion.query()
      .where({
        type: "thread",
      })
      .page(parseInt(page) - 1, parseInt(limit));

    const data = {
      limit,
      page,
      total: result.total,
      data: result.results,
    };
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.removeThread = async (req, res) => {
  try {
    const { threadId } = req?.query;
    const { customId } = req?.user;
    await Discussion.query()
      .deleteById(threadId)
      .where({ created_by: customId });
    res.json({
      message: "Thread deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ini semua asn
module.exports.createPost = async (req, res) => {
  try {
    const { customId } = req.user;
    const { threadId } = req.query;

    await Discussion.create({
      ...req.body,
      type: "post",
      created_by: customId,
      discussion_id: threadId,
    });

    res.json({
      message: "Post created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.updatePost = async (req, res) => {
  try {
    const { userId } = req.user;
    const { postId, threadId } = req.query;

    await Discussion.query()
      .patch({
        ...req.body,
        created_by: userId,
      })
      .where({
        id: postId,
        discussion_id: threadId,
      });

    res.json({
      message: "Post updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.removePost = async (req, res) => {
  try {
    const { customId } = req.user;
    const { postId, threadId } = req.query;

    await Discussion.query().deleteById(postId).where({
      created_by: customId,
      discussion_id: threadId,
      type: "post",
    });

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getPosts = async (req, res) => {
  try {
    const { threadId } = req.query;
    const limit = req?.query?.limit || 10;
    const page = req?.query?.page || 1;

    const result = await Discussion.query()
      .where({
        type: "post",
        discussion_id: threadId,
      })
      .page(parseInt(page) - 1, parseInt(limit));

    const data = {
      limit,
      page,
      total: result.total,
      data: result.results,
    };
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getPost = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ini semua asn
module.exports.createComment = async (req, res) => {
  try {
    const { customId } = req.user;
    const { postId } = req.query;

    const result = await Discussion.create({
      ...req.body,
      type: "comment",
      created_by: customId,
      discussion_id: postId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports.updateComment = async (req, res) => {
  try {
    const { customId } = req.user;
    const { postId, commentId } = req.query;

    const result = await Discussion.query()
      .patch({
        ...req.body,
        created_by: customId,
      })
      .where({
        id: commentId,
        discussion_id: postId,
      });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getComments = async (req, res) => {
  try {
    const { postId } = req.query;
    const limit = req?.query?.limit || 10;
    const page = req?.query?.page || 1;

    const result = await Discussion.query()
      .where({
        type: "comment",
        discussion_id: postId,
      })

      .page(parseInt(page) - 1, parseInt(limit));

    const data = {
      limit,
      page,
      total: result.total,
      data: result.results,
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.removeComment = async (req, res) => {
  try {
    const { customId } = req.user;
    const { postId, commentId } = req.query;

    await Discussion.query().deleteById(commentId).where({
      created_by: customId,
      discussion_id: postId,
      type: "comment",
    });

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ini semua asn
module.exports.upvote = async (req, res) => {};
module.exports.downvote = async (req, res) => {};
