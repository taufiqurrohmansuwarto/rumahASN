const SubCategories = require("../models/sub-categories.model");

const index = async (req, res) => {
  try {
    const result = await SubCategories.query()
      .withGraphFetched("[category, created_by]")
      .orderBy("created_at", "desc");
    res.json(result);
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
    const result = await SubCategories.query().insert({
      name,
      category_id,
      description,
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
    const result = await SubCategories.query().patchAndFetchById(id, {
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
    const result = await SubCategories.query().deleteById(id);
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
