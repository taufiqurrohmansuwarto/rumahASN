const User = require("../models/users.model");

module.exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    const search = req.query.search || "";

    // ini hanya pns yang dapat berubah menjadi admin
    const users = await User.query()
      .where("from", "=", "master")
      .andWhereNot("custom_id", req?.user?.customId)
      .where((builder) => {
        if (search) {
          builder.where("username", "ilike", `%${search}%`);
        }
      })
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

    const currentUser = await User.query().findById(id);

    await User.query()
      .patch({
        current_role: currentUser?.current_role === "admin" ? "agent" : "admin",
      })
      .where("custom_id", id);

    res.json({ code: 200, message: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

module.exports.detail = async (req, res) => {
  try {
    const { id } = req?.query;
    const currentUser = await User.query().findById(id);

    res.json(currentUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};
