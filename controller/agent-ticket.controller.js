const Tickets = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    // buat filter
    const status = req?.query?.status || "SEMUA";
    const kode_ticket = req?.query?.kode_tiket;

    const result = await Tickets.query()
      .withGraphFetched("[]")
      .where("assignee", customId)
      .where((builder) => {
        if (status !== "SEMUA") {
          builder.where("status", status);
        }
        if (kode_ticket) {
          builder.where("kode_ticket", kode_ticket);
        }
      })
      .page(page - 1, limit);

    res.json({ data: result?.results, page, total: result.total });
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

const update = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const remove = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const kerjakanTicket = async (req, res) => {
  try {
    const { customId } = req;
    const { id } = req.query;

    const data = await Tickets.query()
      .update({ status: "DIKERJAKAN" })
      .where("id", id)
      .andWhere("assignee", customId)
      .returning("*")
      .first();
    res
      .status(200)
      .json({ code: 200, message: "Status berubah menjadi dikerjakan", data });
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

// apa seharusnya begini?
const hapusTicket = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  index,
  detail,
  update,
  remove,
  kerjakanTicket,
  hapusTicket,
};
