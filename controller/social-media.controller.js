const SocmedPosts = require("@/models/socmed-posts.model");
const SocmedComments = require("@/models/socmed-comments.model");
const SocmedLikes = require("@/models/socmed-likes.model");
const SocmedShares = require("@/models/socmed-shares.model");
const SocmedAudits = require("@/models/socmed-audits.model");

const posts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = Math.min(req.query.limit || 10, 50);

    const result = await SocmedPosts.query()
      .withGraphFetched("[comments, likes, shares, user]")
      .page(page - 1, limit)
      .orderBy("created_at", "desc");

    const data = {
      data: result?.results,
      pagination: {},
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
      .withGraphFetched("[comments, likes, shares, user]");
    res.json(result);
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

    const result = await SocmedPosts.query().patchAndFetchById(postId, {
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

const removePost = async (req, res) => {
  try {
    const { postId } = req?.query;
    const { customId: userId } = req?.user;

    const result = await SocmedPosts.query()
      .where({
        id: postId,
        user_id: userId,
      })
      .delete();

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const comments = async (req, res) => {};
const detailComment = async (req, res) => {};
const createComment = async (req, res) => {};
const updateComment = async (req, res) => {};
const removeComment = async (req, res) => {};

module.exports = {
  posts,
  detailPost,
  createPost,
  updatePost,
  removePost,
};
