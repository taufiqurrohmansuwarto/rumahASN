const SavedReplies = require("@/models/saved-replies.model");

const get = async (req, res) => {
  try {
    const { id: savedReplyId } = req?.query;
    const { customId: userId } = req.user;

    const savedReply = await SavedReplies.query()
      .where("user_id", userId)
      .andWhere("id", savedReplyId)
      .first();
    res.json(savedReply);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const list = async (req, res) => {
  try {
    // get user_id from request
    const { customId: user_id } = req.user;

    // get saved replies from user
    const result = await SavedReplies.query()
      .where("user_id", user_id)
      .orderBy("created_at", "desc");

    // return the saved replies
    res.json(result);
  } catch (error) {
    // return internal server error
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId: user_id } = req.user;

    const payload = {
      ...req.body,
      user_id,
    };

    await SavedReplies.query().insert(payload);
    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    // get the id from the request query
    const { id } = req?.query;
    // get the user id from the request user object
    const { customId: user_id } = req.user;
    // update the saved reply in the database
    await SavedReplies.query()
      .where("user_id", user_id)
      .andWhere("id", id)
      .update({
        ...req.body,
      });
    // return a success response
    res.json({ code: 200, message: "Success" });
  } catch (error) {
    // catch any error and return an error response
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: user_id } = req.user;
    await SavedReplies.query()
      .where("user_id", user_id)
      .andWhere("id", id)
      .delete();
    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  get,
  list,
  create,
  update,
  remove,
};
