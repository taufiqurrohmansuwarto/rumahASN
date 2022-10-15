const { default: Tickets } = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;

    //     search, page, limit
    const search = req?.query?.search;
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;

    const result = await Tickets.query()
      .where("user_id", customId)
      .andWhere((builder) => {
        if (search) {
          builder
            .where("title", "ilike", `%${search}%`)
            .orWhere("description", "ilike", `%${search}%`);
        }
      })
      .orderBy("created_at", "desc")
      .page(page - 1, limit);

    res.json({
      data: result,
      total: result.total,
      meta: { page, limit, sort, order },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const detail = async (req, res) => {
  try {
    const { customId } = req?.user;
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const create = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { body } = req;
    const data = { ...body, requester: customId };

    const result = await Tickets.query().insert(data).returning("*");
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};
const update = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};
const remove = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  create,
  update,
  remove,
};
