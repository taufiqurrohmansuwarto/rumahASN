const User = require("@/models/users.model");
const Ticket = require("@/models/tickets.model");
const { raw } = require("objection");

module.exports.getOwnProfile = async (req, res) => {
  try {
    const { customId: userId, current_role } = req.user;
    const result = await User.query()
      .where("custom_id", userId)
      .first()
      .select(
        "image",
        "current_role",
        "about_me",
        "username",
        "employee_number",
        "info"
      );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.updateOwnProfile = async (req, res) => {
  try {
    const { customId: userId } = req.user;

    const { about_me } = req.body;

    await User.query()
      .patch({
        about_me,
      })
      .where("custom_id", userId);

    res.json({
      code: 200,
      message: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports.detailUserProfile = async (req, res) => {
  try {
    const { id } = req.query;
    const { current_role } = req?.user;

    let result;
    let select;

    if (current_role === "admin" || current_role === "agent") {
      select = [
        "custom_id",
        "username",
        "image",
        "about_me",
        "group",
        "current_role",
        "birthdate",
        "employee_number",
        "info",
      ];
    } else {
      select = ["username", "image", "about_me", "current_role", "custom_id"];
    }

    const currentUser = await User.query()
      .where("custom_id", id)
      .first()
      .select(select);

    const totalPost = await Ticket.query()
      .where("requester", id)
      .count("id as total_post")
      .first();

    result = {
      ...currentUser,
      total_post: totalPost?.total_post || 0,
    };

    // get statistics if current_user is admin or agent

    if (
      currentUser?.current_role === "admin" ||
      currentUser?.current_role === "agent"
    ) {
      // get statistics ticket
      const tickets = await Ticket.query()
        .select(
          "assignee",
          raw(
            `count(case when status_code = 'DIAJUKAN' then 1 end) as tiket_diajukan`
          ),
          raw(
            `count(case when status_code = 'DIKERJAKAN' then 1 end) as tiket_dikerjakan`
          ),
          raw(
            `count(case when status_code = 'SELESAI' then 1 end) as tiket_diselesaikan`
          ),
          raw(`count(case when stars is not null then 1 end) as tiket_dinilai`)
        )
        .where("assignee", id)
        .count("id as total_ticket")
        .avg("stars as avg_rating")
        .groupBy("assignee");

      const rating = await Ticket.query()
        .select("stars", "requester_comment", "requester", "id")
        .withGraphFetched("customer(simpleSelect)")
        .where("assignee", id)
        .andWhereNot("stars", null);

      result = {
        ...result,
        tickets,
        rating,
      };
    }

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
