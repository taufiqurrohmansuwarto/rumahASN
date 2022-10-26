const Ticket = require("../models/tickets.model");

const customerDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;

    // its must be filter by query

    // count all tickets

    const result = await Ticket.query()
      .count()
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
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;
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
