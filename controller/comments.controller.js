const Comments = require("../models/comments.model");

const index = async (req, res) => {
  try {
    // infinite scroll
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    const result = await Comments.query()
      .page(page - 1, limit)
      .orderBy("created_at", "desc");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await Comments.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    const { body } = req;

    await Comments.query()
      .update(body)
      .where("id", id)
      .andWhere("user_custom_id", customId);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    const { customId } = req?.user;

    await Comments.query()
      .delete()
      .where("id", id)
      .andWhere("user_custom_id", customId);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { body } = req;

    await Comments.query().insert({
      ...body,
      user_custom_id: customId,
    });
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
  update,
  remove,
  create,
};
