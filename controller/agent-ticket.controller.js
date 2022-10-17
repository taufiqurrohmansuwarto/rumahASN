const Tickets = require("../models/tickets.model");

const index = async (req, res) => {
  try {
    const { customId } = req?.user;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || "";

    const result = await Tickets.query().where("").page(page, limit);
    res.json({ results: result });
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

module.exports = {
  index,
  detail,
  update,
  remove,
};
