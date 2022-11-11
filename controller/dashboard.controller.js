const Status = require("../models/status.model");
const Tickets = require("../models/tickets.model");
const knex = Status.knex();
const { raw } = require("objection");

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
    const type = req?.query?.type || "standard";

    const startDate = req?.query?.startDate;
    const endDate = req?.query?.endDate;

    if (type === "standard") {
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
    }

    if (type === "rating") {
      const result = await Tickets.query()
        .where({
          assignee: customId,
          status_code: "SELESAI",
        })
        .avg("stars")
        .select(raw(`to_char(avg(stars), 'FM999999999.0') as avg`));

      res.json(result);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ code: 400, message: "Internal Server Error" });
  }
};

const adminDashboard = async (req, res) => {
  try {
    const result = await knex.raw(
      `
      select status.name, coalesce(t.count, 0) as count
from (select status_code, count(status_code)
      from tickets
      group by 1) as t
         right join status on t.status_code = status.name
      `
    );

    res.json(result?.rows);
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
