const Status = require("../models/status.model");
const Tickets = require("../models/tickets.model");
const knex = Status.knex();
const { raw } = require("objection");
const {
  getUsersAge,
  getTotalCaraMasuk,
  getUsersByDepartment,
  getTopDepartmentQuestion,
} = require("@/utils/query-utils");

const AssitantBotMessages = require("@/models/assistant_bot/messages.model");

export const cekTotalPenggunaBestie = async (req, res) => {
  try {
    // select count(distinct (user_id)) from assistant_bot.messages
    const result = await AssitantBotMessages.query().select(
      raw("count(distinct (user_id))")
    );

    const total = result[0]?.count;
    res.json({ total: parseInt(total) });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const dayjs = require("dayjs");
const { startCase, toLower } = require("lodash");
require("dayjs/locale/id");
dayjs.locale("id");

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

const queryLast7DaysAll = async () => {
  const result = await knex.raw(
    `SELECT TO_CHAR(dates.date, 'dd-mm-yyyy') AS date,
       COALESCE(t.count, 0) AS count,
       s.status_code
FROM (SELECT generate_series(now()::date - interval '6 day', now()::date, interval '1 day') AS date) dates
         CROSS JOIN (SELECT DISTINCT status_code FROM tickets) s
         LEFT JOIN (SELECT date_trunc('day', created_at) AS date, status_code, COUNT(*) AS count
                    FROM tickets
                    WHERE created_at >= now()::date - interval '6 day'
                    GROUP BY date, status_code) t ON t.date = dates.date AND t.status_code = s.status_code
ORDER BY dates.date ASC,
         s.status_code ASC;`
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

const parsingInteger = (data) => {
  if (data?.length) {
    return data?.map((item) => ({
      ...item,
      value: parseInt(item?.value, 10),
    }));
  } else {
    return [];
  }
};

const adminDashboard = async (req, res) => {
  const type = req?.query?.type || "standard";

  try {
    if (type === "group-age") {
      const ages = await getUsersAge();
      const groups = await getTotalCaraMasuk();

      const hasil = {
        ages: parsingInteger(ages.rows),
        groups: parsingInteger(groups.rows),
      };
      res.json(hasil);
    }

    if (type === "visitors") {
      const result =
        await knex.raw(`SELECT TRIM(TO_CHAR(created_at, 'Day, DD-MM-YYYY')) AS tanggal, COUNT(DISTINCT user_id)
FROM users_histories
WHERE action = 'login'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY TRIM(TO_CHAR(created_at, 'Day, DD-MM-YYYY')), DATE(created_at)
ORDER BY DATE(created_at);
`);

      res.json(result?.rows);
    }

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

      const data = result?.rows?.map((r) => ({
        ...r,
        count: parseInt(r?.count, 10),
      }));

      res.json(data);
    } else if (type === "last7Days") {
      const result = await queryLast7Days();

      if (result?.length) {
        const hasil = result?.map((item) => ({
          date: dayjs(item?.date).format("DD-MM-YYYY"),
          count: parseInt(item?.count, 10),
        }));
        res.json(hasil);
      } else if (type === "lastMonth") {
        const result = await queryLastMonth();

        if (result?.length) {
          const hasil = result?.map((item) => ({
            date: dayjs(item?.date).format("DD-MM-YYYY"),
            count: parseInt(item?.count, 10),
          }));
          res.json(hasil);
        }
      } else {
        res.json(result);
      }

      // query for last 7 days
    } else if (type === "last7DaysAll") {
      const result = await queryLast7DaysAll();
      res.json(result);
    } else if (type === "aggregateSubCategories") {
      const result = await aggregateBySubCategories();

      res.json(result);
    } else if (type === "departments") {
      const result = await getUsersByDepartment();
      const data = result?.map((r) => ({
        ...r,
        perangkat_daerah: startCase(
          toLower(r?.perangkat_daerah?.split("-")?.[0])
        ),
        total: parseInt(r?.total, 10),
      }));

      res.json(data);
    } else if (type === "top-department-question") {
      const result = await getTopDepartmentQuestion();
      const data = result?.map((r) => ({
        ...r,
        perangkat_daerah: startCase(
          toLower(r?.perangkat_daerah_name?.split("-")?.[0])
        ),
        total: parseInt(r?.total_tickets, 10),
      }));
      res.json(data);
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
