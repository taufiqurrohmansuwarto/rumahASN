const Comments = require("../models/comments.model");

const index = async (req, res) => {
  try {
    // infinite scroll
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    // add with count
    const result = await Comments.query()
      .select(
        "comments.*",
        Comments.relatedQuery("comments").count().as("comment_count")
      )
      .whereNot("comment_id", null)
      .page(page - 1, limit)
      .withGraphFetched("[user(simpleSelect)]")
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
    const result = await Comments.query()
      .findById(id)
      .withGraphFetched(
        "[user(simpleSelect), comments(allSelect).[user(simpleSelect)]]"
      );
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

    const result = await Comments.query()
      .insert({
        message: body?.comment,
        comment_id: body?.comment_id,
        user_custom_id: customId,
      })
      .returning("*")
      .first()
      .debug("*");
    res.status(201).json({ code: 201, message: "success", data: result });
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
