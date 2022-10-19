// just look and view

const Status = require("../models/status.model");
const Tickets = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const status = req?.query?.status || "all";
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 50;

    const result = await Tickets.query()
      .where((builder) => {
        if (status !== "all") {
          builder.where("status_code", status);
        }
      })
      .page(page - 1, limit)
      .orderBy("created_at", "desc");

    res.json({
      results: result?.results,
      total: result?.total,
      page: page,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};
const detail = async (req, res) => {
  try {
    const result = await Tickets.query().findById(req?.query?.id);
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
};
