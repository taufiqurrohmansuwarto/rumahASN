const Ticket = require("@/models/tickets.model");
const { raw } = require("objection");

const publicDashboard = async (req, res) => {
  try {
    // todo ini digunakan untuk melakukan query dashboard berdasarkan BIDANG yang dapat dilihat bu kaban
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const landingPageData = async (req, res) => {
  try {
    const ticketsWithRatings = await Ticket.query()
      .distinct("requester")
      .where("stars", "=", 5)
      // requester comment character length > 15
      .andWhere(raw("LENGTH(requester_comment)"), ">", 30)
      .andWhereNot("requester_comment", null)
      .select("id", "stars", "requester_comment", "requester", "updated_at")
      .withGraphFetched("[customer(simpleSelect)]")
      .limit(9)
      .orderBy("updated_at", "desc");

    const ticketsPin = await Ticket.query()
      .where("is_pinned", true)
      .select("id", "title", "content")
      .withGraphFetched("[customer(simpleSelect)]");

    res.json({
      ticketsPin,
      ticketsWithRatings,
    });
  } catch (error) {
    console.log(error);
    res.json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  publicDashboard,
  landingPageData,
};
