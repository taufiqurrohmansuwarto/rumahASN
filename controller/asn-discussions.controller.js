const AsnDiscussions = require("@/models/d_posts.model");
const AsnDiscussionComments = require("@/models/d_comments.model");

const getDiscussions = async (req, res) => {
  try {
    const limit = req?.query?.limit || 10;
    const page = req?.query?.page || 1;

    const result = await AsnDiscussions.query().page(
      parseInt(page) - 1,
      parseInt(limit)
    );

    const data = {
      limit,
      page,
      total: result.total,
      data: result.results,
    };
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const {
      user: { customId },
    } = req;

    const result = await AsnDiscussions.create({
      ...req.body,
      created_by: customId,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateDiscussion = async (req, res) => {};
const deleteDiscussion = async (req, res) => {};
const getDiscussion = async (req, res) => {};
const upvoteDiscussion = async (req, res) => {};
const downvoteDiscussion = async (req, res) => {};

const getDiscussionComments = async (req, res) => {};
const createDiscussionComment = async (req, res) => {};
const updateDiscussionComment = async (req, res) => {};
const deleteDiscussionComment = async (req, res) => {};
const getDiscussionComment = async (req, res) => {};
const upvoteDiscussionComment = async (req, res) => {};
const downvoteDiscussionComment = async (req, res) => {};

module.exports = {
  getDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  getDiscussion,
  upvoteDiscussion,
  downvoteDiscussion,
  getDiscussionComments,
  createDiscussionComment,
  updateDiscussionComment,
  deleteDiscussionComment,
  getDiscussionComment,
  upvoteDiscussionComment,
  downvoteDiscussionComment,
};
