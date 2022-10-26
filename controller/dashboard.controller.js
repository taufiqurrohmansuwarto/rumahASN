const Ticket = require("../models/tickets.model");

const customerDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;

    // its must be filter by query

    // aggregate by status_code
    const result = await Ticket.query()
      .count()
      .select("status_code")
      .where("requester", customId)
      .groupBy("status_code");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const agentDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await Ticket.query()
      .count()
      .select("status_code")
      .where("requester", customId)
      .groupBy("status_code");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await Ticket.query()
      .count()
      .select("status_code")
      .where("requester", customId)
      .groupBy("status_code");

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

module.exports = {
  customerDashboard,
  agentDashboard,
  adminDashboard,
};
