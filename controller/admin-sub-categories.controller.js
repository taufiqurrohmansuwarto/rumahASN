const SubCategories = require("../models/sub-categories.model");
const Tickets = require("@/models/tickets.model");
const { raw } = require("objection");

const index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const search = req.query.search || "";

    let query = SubCategories.query()
      .select("*", raw("EXTRACT(EPOCH FROM durasi / 60) as durasi"))
      .where((builder) => {
        if (search) {
          builder.where("name", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched("[category, created_by]")
      .orderBy("created_at", "desc");

    let result;

    if (parseInt(limit) === -1) {
      // Tanpa paging
      const data = await query;
      result = {
        results: data,
        total: data.length,
      };
    } else {
      result = await query.page(parseInt(page) - 1, parseInt(limit));
    }

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

const popularSubCategory = async (req, res) => {
  try {
    const popularSubCategories = await Tickets.query()
      .select("sub_category_id")
      .count("sub_category_id")
      .groupBy("sub_category_id")
      .orderBy("count", "desc")
      .limit(10);

    const subCategories = await SubCategories.query()
      .select("id", "name")
      .withGraphFetched("category(simple)")
      .findByIds(popularSubCategories.map((item) => item.sub_category_id));

    res.json(subCategories);
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
    const { name, category_id, description, durasi } = req.body;
    const { customId } = req?.user;
    const result = await SubCategories.query().insert({
      name,
      category_id,
      description,
      user_id: customId,
      durasi: `${durasi} minutes`,
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
    const { name, category_id, description, durasi } = req.body;
    await SubCategories.query().patchAndFetchById(id, {
      name,
      category_id,
      description,
      durasi: `${durasi} minutes`,
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
  popularSubCategory,
};
