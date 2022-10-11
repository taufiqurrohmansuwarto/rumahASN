const User = require("../models/users.model");

module.exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    // should be pagination and searching
    const users = await User.query()
      .where("organization_id", "ilike", "123%")
      .page(page - 1, limit);

    res.json({ data: users?.results, total: users.total });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

module.exports.patch = async (req, res) => {
  try {
    const { id } = req.query;
    await User.query().findById(id).patch(req.body);
    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};
