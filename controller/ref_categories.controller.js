const Categories = require("../models/categories.model.js");

module.exports.index = async (req, res) => {
  try {
    // ga usah dipaging aja ya
    const result = await Categories.query()
      .withGraphFetched("[createdBy(simpleSelect)]")
      .orderBy("id", "desc");
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const result = await Categories.query().insert({
      ...req.body,
      created_by: userId,
    });
    res.json({ code: 200, message: "success", data: result });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.detail = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await Categories.query().findById(id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.query;
    const { customId: userId } = req?.user;

    await Categories.query()
      .findById(id)
      .patch({
        ...req.body,
        updated_by: userId,
        updated_at: new Date(),
      });
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports.remove = async (req, res) => {
  try {
    const { id } = req.query;
    await Categories.query().deleteById(id);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
