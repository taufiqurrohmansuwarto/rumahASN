const User = require("../models/users.model");

module.exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;
    const search = req.query.search || "";
    const type = req?.query?.type || "normal";

    // ini hanya pns yang dapat berubah menjadi admin
    if (type === "normal") {
      const users = await User.query()
        .where((builder) => {
          builder.where("from", "master").orWhere("from", "pttpk");
        })
        .andWhere((builder) => {
          builder
            .where("current_role", "agent")
            .orWhere("current_role", "admin");
        })
        // .andWhereNot("custom_id", req?.user?.customId)
        .where((builder) => {
          if (search) {
            builder.where("username", "ilike", `%${search}%`);
          }
        })
        .orderBy("last_login", "desc")
        .page(parseInt(page) - 1, parseInt(limit));

      const data = {
        data: users?.results,
        total: users.total,
        page: parseInt(page),
        limit: parseInt(limit),
      };

      res.json(data);
    }
    if (type === "check_online") {
      const onlineUsers = await User.query().where("is_online", true);
      res.json(onlineUsers);
    }
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

module.exports.searchUser = async (req, res) => {
  try {
    const name = req.query.name || "";
    const result = await User.query()
      .select("custom_id", "username", "image")
      .where("username", "ilike", `%${name}%`)
      .orWhere("employee_number", "ilike", `%${name}%`)
      .limit(10);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

module.exports.googleEditInformation = async (req, res) => {
  try {
    const { customId, group } = req?.user;

    if (group === "GOOGLE") {
      await User.query()
        .patch({
          info: req?.body,
        })
        .where("custom_id", customId);

      res.json({ code: 200, message: "success" });
    } else {
      res.status(403).json({ code: 403, message: "Forbidden" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

module.exports.getUserInformation = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await User.query().where("custom_id", customId).first();
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};

module.exports.getUserInfo = async (req, res) => {
  try {
    const { id } = req?.query;
    const currentUser = req?.user;
    const result = await User.query().findById(id);

    if (!result) {
      return res.json(null);
    }

    const { group } = currentUser;
    const isGroupAsn = group === "MASTER" || group === "PTTPK";

    const response = {
      username: result.username,
      image: result.image,
      information: isGroupAsn ? result.info : null,
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", code: 500 });
  }
};
