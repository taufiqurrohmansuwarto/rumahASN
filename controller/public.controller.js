const Ticket = require("@/models/tickets.model");
const { chunk } = require("lodash");
const { raw } = require("objection");
const WebinarSeries = require("@/models/webinar-series.model");
const CoachingClinic = require("@/models/cc_meetings.model");

const publicDashboard = async (req, res) => {
  try {
    // todo ini digunakan untuk melakukan query dashboard berdasarkan BIDANG yang dapat dilihat bu kaban
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};

const events = async (req, res) => {
  try {
    // get webinar events : properti [status, type, title, action, id]
    // get coaching clinic
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
      .andWhere(raw("LENGTH(requester_comment)"), ">", 10)
      .andWhereNot("requester_comment", null)
      .select("id", "stars", "requester_comment", "requester", "updated_at")
      .withGraphFetched("[customer(simpleSelect)]")
      .limit(27)
      .orderBy("updated_at", "desc");

    // using lodash to divide array into 3 [[],[], []]
    const result = chunk(ticketsWithRatings, 9);
    const hasil = result?.map((_, index) => {
      return {
        key: index,
        data: result[index],
      };
    });

    res.json({
      ticketsWithRatings,
      hasil,
    });
  } catch (error) {
    console.log(error);
    res.json({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  publicDashboard,
  landingPageData,
  events,
};
