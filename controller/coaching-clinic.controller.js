const User = require("@/models/users.model");

const alterUserCoach = async (req, res) => {
  try {
    const { id } = req?.query;

    //     check dulu apakah dia current_role sudah agent atau admin
    const currentUser = await User.query().findById(id);

    if (
      currentUser.current_role !== "agent" &&
      currentUser.current_role !== "admin"
    ) {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      const user = await User.query()
        .patch({
          is_consultant: true,
          update_consultant_at: new Date(),
        })
        .where({ custom_id: id });
      console.log(user);
      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const dropUserCoach = async (req, res) => {
  try {
    const { id } = req?.query;

    const currentUser = await User.query().findById(id);

    if (
      currentUser.current_role !== "agent" &&
      currentUser.current_role !== "admin"
    ) {
      res.status(403).json({ code: 403, message: "Forbidden" });
    } else {
      const user = await User.query()
        .patch({
          is_consultant: false,
          update_consultant_at: new Date(),
        })
        .where({ custom_id: id });
      console.log(user);
      res.json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkStatusCoaching = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await User.query().findById(customId);

    if (!result || !result?.is_consultant) {
      res.json(null);
    } else {
      res.json(true);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  alterUserCoach,
  dropUserCoach,
  checkStatusCoaching,
};