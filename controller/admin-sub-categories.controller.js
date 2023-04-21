const SubCategories = require("../models/sub-categories.model");

const index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const search = req.query.search || "";

    const result = await SubCategories.query()
      .where((builder) => {
        if (search) {
          builder.where("name", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched("[category, created_by]")
      .page(parseInt(page) - 1, parseInt(limit))
      .orderBy("created_at", "desc");

    res.json({
      data: result.results,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Errror" });
  }
};

const detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await SubCategories.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Errror" });
  }
};

const create = async (req, res) => {
  try {
    const { name, category_id, description } = req.body;
    const { customId } = req?.user;
    const result = await SubCategories.query().insert({
      name,
      category_id,
      description,
      user_id: customId,
    });
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Errror" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req?.query;
    const { name, category_id, description } = req.body;
    await SubCategories.query().patchAndFetchById(id, {
      name,
      category_id,
      description,
    });
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Errror" });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req?.query;
    await SubCategories.query().deleteById(id);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Errror" });
  }
};

module.exports = {
  index,
  detail,
  create,
  update,
  remove,
};
