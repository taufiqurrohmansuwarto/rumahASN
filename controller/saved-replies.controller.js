const SavedReplies = require("@/models/saved-replies.model");

const get = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: user_id } = req.user;

    const result = await SavedReplies.query()
      .where("user_id", user_id)
      .andWhere("id", id)
      .first();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const list = async (req, res) => {
  try {
    const { customId: user_id } = req.user;
    const result = await SavedReplies.query().where("user_id", user_id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId: user_id } = req.user;
    await SavedReplies.query().insert({
      ...req.body,
      user_id,
    });
    res.json({ code: 200, message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId: user_id } = req.user;
    await SavedReplies.query()
      .where("user_id", user_id)
      .andWhere("id", id)
      .update({
        ...req.body,
      });
    res.json({ code: 200, message: "Success" });
  } catch (error) {
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
