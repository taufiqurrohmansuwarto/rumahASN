// just look and view

const Status = require("../models/status.model");
const Tickets = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const search = req?.query?.search || "";
    const status = req?.query?.status || "all";

    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 50;

    let statusId;

    if (status) {
      const result = await Status.query().where("name", status).first();
      statusId = result?.id;
    }

    const result = await Tickets.query()
      .where((builder) => {
        if (status !== "all") {
          builder.where("status_id", statusId);
        }
        if (search) {
          builder.where("title", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched("[pembuat, priorities, status, categories]")
      .page(page - 1, limit);

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
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
};
