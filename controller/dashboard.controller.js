const Status = require("../models/status.model");
const Tickets = require("../models/tickets.model");
const knex = Status.knex();
const { raw } = require("objection");
const moment = require("moment");

const aggregateBySubCategories = async () => {
  const result = await knex.raw(
    `select sc.name, count(tickets.sub_category_id)
from tickets
         left join sub_categories sc on sc.id = tickets.sub_category_id
group by 1
order by 2 desc`
  );

  return result?.rows;
};

const queryLast7Days = async () => {
  const result = await knex.raw(
    `select d.date, count(tickets.id)
from (select date::date
      from generate_series(
                       date_trunc('day', now()) - interval '7 days',
                       date_trunc('day', now()),
                       '1 day'
               ) as date) d
         left outer join tickets on d.date = tickets.created_at::date
group by d.date order by d.date`
  );

  return result?.rows;
};

const queryLastMonth = async () => {
  const result = await knex.raw(
    `select d.date, count(tickets.id)
from (select date::date
      from generate_series(
                       date_trunc('day', now()) - interval '30 days',
                       date_trunc('day', now()),
                       '1 day'
               ) as date) d
         left outer join tickets on d.date = tickets.created_at::date
group by d.date order by d.date`
  );

  return result?.rows;
};

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
  const type = req?.query?.type || "standard";

  try {
    if (type === "standard") {
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
    } else if (type === "last7Days") {
      const result = await queryLast7Days();

      if (result?.length) {
        const hasil = result?.map((item) => ({
          date: moment(item?.date).format("DD-MM-YYYY"),
          count: parseInt(item?.count, 10),
        }));
        res.json(hasil);
      } else if (type === "lastMonth") {
        const result = await queryLastMonth();

        if (result?.length) {
          const hasil = result?.map((item) => ({
            date: moment(item?.date).format("DD-MM-YYYY"),
            count: parseInt(item?.count, 10),
          }));
          res.json(hasil);
        }
      } else {
        res.json(result);
      }

      // query for last 7 days
    } else if (type === "aggregateSubCategories") {
      const result = await aggregateBySubCategories();

      res.json(result);
    }
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
