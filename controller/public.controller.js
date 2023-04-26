const Ticket = require("@/models/tickets.model");

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
      .whereNot("stars", null)
      .select("id", "stars", "requester_comment", "requester")
      .withGraphFetched("[customer(simpleSelect)]");

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
