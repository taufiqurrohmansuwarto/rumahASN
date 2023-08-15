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

module.exports.createPost = async (req, res) => {};
module.exports.updatePost = async (req, res) => {};
module.exports.removePost = async (req, res) => {};
module.exports.getPost = async (req, res) => {};

module.exports.createComment = async (req, res) => {};
module.exports.updateComment = async (req, res) => {};
module.exports.getComment = async (req, res) => {};
module.exports.removeComment = async (req, res) => {};

module.exports.upvote = async (req, res) => {};
module.exports.downvote = async (req, res) => {};
