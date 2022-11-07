const Ticket = require("../models/tickets.model");
const Status = require("../models/status.model");
const knex = Status.knex();

const requesterCount = async (userId) => {
  const result = await knex.raw(
    `
      select status.name, coalesce(t.count, 0) as count
from (select status_code, count(status_code)
      from tickets
      where tickets.requester = ? 
      group by 1) as t
         right join status on t.status_code = status.name
    `,
    [userId]
  );

  return result?.rows;
};

const customerDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;
    const count = await requesterCount(`${customId}`);
    res.json(count);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const agentDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await knex.raw(
      `
      select status.name, coalesce(t.count, 0) as count
from (select status_code, count(status_code)
      from tickets
      where tickets.assignee = ? 
      group by 1) as t
         right join status on t.status_code = status.name
      `,
      [customId]
    );
    res.json(result?.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const { customId } = req?.user;
    const result = await aggregateCount(customId);
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
