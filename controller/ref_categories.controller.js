const Categories = require("../models/categories.model.js");

module.exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const search = req.query.search || "";

    // ga usah dipaging aja ya
    if (limit === -1 || limit === "-1") {
      const result = await Categories.query()
        .withGraphFetched("[createdBy(simpleSelect)]")
        .orderBy("id", "desc");

      res.json(result);
    } else {
      const result = await Categories.query()
        .withGraphFetched("[createdBy(simpleSelect)]")
        .page(parseInt(page) - 1, limit)
        .where((builder) => {
          if (search) {
            builder.where("name", "ilike", `%${search}%`);
          }
        })
        .orderBy("id", "desc");

      res.json({
        data: result.results,
        total: result.total,
        page,
        limit,
      });
    }
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
