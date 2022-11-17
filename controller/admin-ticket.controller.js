// just look and view

const Tickets = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const status = req?.query?.status || "all";
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 50;

    const search = req?.query?.search || "";

    const result = await Tickets.query()
      .where((builder) => {
        if (status !== "all") {
          builder.where("status_code", status);
        }
        if (search) {
          builder
            .where("title", "ilike", `%${search}%`)
            .orWhere("ticket_number", "ilike", `%${search}%`);
        }
      })
      .withGraphFetched(
        "[customer(simpleSelect), agent(simpleSelect), sub_category.[category], priorities]"
      )
      .page(page - 1, limit)
      .orderBy("updated_at", "desc");

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

const update = async (req, res) => {
  try {
    const body = req?.body;
    const { id } = req?.query;

    await Tickets.query()
      .patch({ ...body })
      .where("id", id);

    console.log(body);
    res.json({
      code: 200,
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
  update,
};
