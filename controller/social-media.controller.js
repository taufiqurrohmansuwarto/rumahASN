const SocmedPosts = require("@/models/socmed-posts.model");
const SocmedComments = require("@/models/socmed-comments.model");
const SocmedLikes = require("@/models/socmed-likes.model");
const SocmedShares = require("@/models/socmed-shares.model");
const SocmedAudits = require("@/models/socmed-audits.model");
const SocmedNotifications = require("@/models/socmed-notifications.model");
const { parseMarkdown } = require("@/utils/parsing");

const arrayToTree = require("array-to-tree");

const handleLike = async (userId, postId) => {
  try {
    const existingLike = await SocmedLikes.query()
      .where({
        user_id: userId,
        post_id: postId,
      })
      .first();

    const currentPost = await SocmedPosts.query().findById(postId);

    if (existingLike) {
      await SocmedLikes.query()
        .where({
          user_id: userId,
          post_id: postId,
        })
        .delete();

      await SocmedPosts.query().findById(postId).decrement("likes_count", 1);
    } else {
      await SocmedLikes.query().insert({
        user_id: userId,
        post_id: postId,
      });

      const data = {
        user_id: userId,
        trigger_user_id: currentPost?.user_id,
        type: "like_asn_update",
        reference_id: postId,
      };
      await SocmedNotifications.query().insert(data);
      await SocmedPosts.query().findById(postId).increment("likes_count", 1);
    }
  } catch (error) {
    console.log(error);
  }
};

const posts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    // limit 10, max 50
    const limit = Math.min(req.query.limit || 10, 50);
    const sortBy = req.query.sortBy || "latest";

    let query = SocmedPosts.query()
      .withGraphFetched("[user(simpleSelect), likes.[user(simpleNoAvatar)] ]")
      .page(page - 1, limit);

    if (sortBy === "latest") {
      query = query.orderBy("created_at", "desc");
    } else if (sortBy === "popular") {
      query = query.orderBy("likes_count", "desc");
    } else if (sortBy === "trending") {
      query = query.orderBy("comments_count", "desc");
    }

    const result = await query;

    const results = result?.results.map((item) => {
      return {
        ...item,
        html: item?.content ? parseMarkdown(item?.content) : "",
      };
    });

    const data = {
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(result?.total),
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const myPosts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    // limit 10, max 50
    const limit = Math.min(req.query.limit || 10, 50);
    const sortBy = req.query.sortBy || "latest";

    const { customId: userId } = req?.user;

    let query = SocmedPosts.query()
      .where({
        user_id: userId,
      })
      .withGraphFetched(`[user(simpleSelect), likes.[user(simpleNoAvatar)]]`)
      .page(page - 1, limit);

    if (sortBy === "popular") {
      query = query.orderBy("likes_count", "desc");
    } else if (sortBy === "trending") {
      query = query.orderBy("comments_count", "desc");
    } else if (sortBy === "latest") {
      query = query.orderBy("created_at", "desc");
    }

    const result = await query;

    const data = {
      data: result?.results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(result?.total),
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const detailPost = async (req, res) => {
  try {
    const { postId } = req?.query;
    const result = await SocmedPosts.query()
      .findById(postId)
      .withGraphFetched("[comments, likes, shares, user(simpleSelect)]");

    const data = {
      ...result,
      html: result?.content ? parseMarkdown(result?.content) : "",
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createPost = async (req, res) => {
  try {
    const data = req.body;
    const { customId: userId } = req?.user;

    const result = await SocmedPosts.query().insert({
      ...data,
      user_id: userId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { postId } = req?.query;
    const data = req.body;
    const { customId: userId } = req?.user;

    const result = await SocmedPosts.query()
      .where({
        id: postId,
        user_id: userId,
      })
      .first();

    await result?.$query().patch({
      ...data,
      user_id: userId,
      id: postId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const removePost = async (req, res) => {
  try {
    const { postId } = req?.query;
    const { customId: userId } = req?.user;

    const result = await SocmedPosts.query()
      .where({
        id: postId,
        user_id: userId,
      })
      .first();

    await result?.$query().delete();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const postLikes = async (req, res) => {
  try {
    const { postId } = req?.query;
    const { customId: userId } = req?.user;

    await handleLike(userId, postId);

    res.json({
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const comments = async (req, res) => {
  try {
    const { postId } = req?.query;

    const result = await SocmedComments.query()
      .where({
        post_id: postId,
      })
      .withGraphFetched("[user(simpleSelect)]")
      .orderBy("created_at", "desc");

    const hasil = result.map((item) => {
      return {
        ...item,
        html: item?.comment ? parseMarkdown(item?.comment) : "",
      };
    });

    const data = arrayToTree(hasil, {
      parentProperty: "parent_id",
      customID: "id",
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const detailComment = async (req, res) => {};

const createComment = async (req, res) => {
  try {
    const { postId } = req?.query;
    const data = req.body;
    const { customId: userId } = req?.user;

    const currentPost = await SocmedPosts.query()
      .findById(postId)
      .select("user_id");
    const currentUserPost = currentPost?.user_id;

    const payload = {
      ...data,
      user_id: userId,
      post_id: postId,
    };

    const result = await SocmedComments.query().insert(payload);

    if (payload?.parent_id) {
      const allUserInPost = await SocmedComments.query()
        .where("post_id", postId)
        .andWhere("user_id", "<>", userId)
        .select("user_id")
        .distinct("user_id");

      const allUserPostIdUnique = allUserInPost.map((item) => item?.user_id);

      // send all user in post
      if (allUserPostIdUnique.length > 0) {
        const payload = allUserPostIdUnique.map((item) => {
          return {
            user_id: userId,
            trigger_user_id: item,
            type: "comment_asn_update",
            reference_id: postId,
          };
        });
        await SocmedNotifications.query().insert(payload);
      } else {
        await SocmedNotifications.query().insert({
          user_id: userId,
          trigger_user_id: currentUserPost,
          type: "comment_asn_update",
          reference_id: postId,
        });
      }
    } else {
      const isNotSelfComment = currentUserPost !== userId;
      if (isNotSelfComment && !payload?.parent_id) {
        await SocmedNotifications.query().insert({
          user_id: userId,
          trigger_user_id: currentUserPost,
          type: "comment_asn_update",
          reference_id: postId,
        });
      }
    }

    await SocmedPosts.query().findById(postId).increment("comments_count", 1);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req?.query;
    const data = req.body;
    const { customId: userId } = req?.user;

    const result = await SocmedComments.query()
      .patchAndFetchById(commentId, {
        ...data,
        user_id: userId,
      })
      .where({
        id: commentId,
        user_id: userId,
        post_id: postId,
      });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
const removeComment = async (req, res) => {
  try {
    const { postId, commentId } = req?.query;
    const { customId: userId } = req?.user;

    const result = await SocmedComments.query()
      .where({
        id: commentId,
        user_id: userId,
        post_id: postId,
      })
      .first();

    await result?.$query().delete();
    await SocmedPosts.query().findById(postId).decrement("comments_count", 1);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const allActivities = async (req, res) => {
  try {
    const page = req.query.page || 1;
    // limit 10, max 50
    const limit = Math.min(req.query.limit || 25, 50);

    const result = await SocmedNotifications.query()
      .orderBy("created_at", "desc")
      .whereNot(function () {
        this.where("type", "like_asn_update").andWhere(
          "user_id",
          "<>",
          "trigger_user_id"
        );
      })
      .withGraphFetched(
        "[user(simpleSelect), trigger_user(simpleSelect), post]"
      )
      .page(page - 1, limit);

    const data = {
      data: result?.results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(result?.total),
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const myActivities = async (req, res) => {
  try {
    const page = req.query.page || 1;
    // limit 10, max 50
    const limit = Math.min(req.query.limit || 10, 50);
    const { customId: userId } = req?.user;

    const result = await SocmedNotifications.query()
      .where("user_id", userId)
      .withGraphFetched("[user(simpleSelect), trigger_user(simpleSelect)]")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    const data = {
      data: result?.results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(result?.total),
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }

  try {
    const { customId: userId } = req?.user;

    const result = await SocmedNotifications.query()
      .where("user_id", userId)
      .withGraphFetched("[user(simpleSelect), trigger_user(simpleSelect)]")
      .orderBy("created_at", "desc");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  posts,
  detailPost,
  createPost,
  updatePost,
  removePost,
  postLikes,
  comments,
  detailComment,
  createComment,
  updateComment,
  removeComment,
  myPosts,
  allActivities,
};
