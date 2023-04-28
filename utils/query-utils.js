const User = require("@/models/users.model");

const knex = User.knex();

module.exports.agentsPerformances = async () => {
  try {
    const result = await knex.raw(
      `SELECT u.custom_id                                                                         AS agent_id,
       u.username                                                                          AS agent_username,
       u.image                                                                             as agent_image,
       COALESCE(COUNT(t.id), 0)                                                            AS total_tickets_handled,
       COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (t.start_work_at - t.created_at)) / 60)::numeric, 2),
                0)                                                                         AS avg_response_time_minutes,
       COALESCE(ROUND(AVG(t.stars), 1), 0)                                                 AS avg_satisfaction_rating,
       ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - t.start_work_at))::numeric) / 60, 2) AS avg_response_time_minutes,
       array_agg(
       jsonb_build_object(
               'ticket_id', t.id,
               'requester_image', req_users.image,
               'requester_comment', t.requester_comment,
               'stars', t.stars
           )
           ) filter ( where t.stars > 0 )                                                  AS feedbacks
FROM users u
         LEFT JOIN
     tickets t ON u.custom_id = t.assignee
         LEFT JOIN
     users req_users ON t.requester = req_users.custom_id
WHERE u."current_role" IN ('admin', 'agent')
GROUP BY u.custom_id, u.username
ORDER BY total_tickets_handled DESC;`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.ticketResponse = async (id) => {
  const result = await knex.raw(
    `SELECT t.id                                                                                         AS tiket_id,
       t.title                                                                                      AS tiket_title,
       t.created_at                                                                                 AS tiket_created_at,
       t.start_work_at                                                                              AS tiket_start_work_at,
       sc.durasi                                                                                    AS sub_category_durasi,
       EXTRACT(EPOCH FROM (t.start_work_at - t.created_at)) / 60                                    AS response_time_minutes,
       (EXTRACT(EPOCH FROM (t.start_work_at - t.created_at)) / EXTRACT(EPOCH FROM sc.durasi)) *
       100                                                                                          AS response_time_percentage
FROM tickets t
         JOIN
     sub_categories sc ON t.sub_category_id = sc.id
WHERE t.start_work_at IS NOT NULL and where t.id = ${id};`
  );

  return result;
};

module.exports.kecepetanResponsePerUser = async () => {
  try {
    const result = await knex.raw(
      `SELECT u.custom_id                                                    AS user_id,
       u.username                                                     AS user_name,
       COUNT(t.id)                                                    AS total_tickets,
       AVG(EXTRACT(EPOCH FROM (t.start_work_at - t.created_at))) / 60 AS avg_response_time_minutes
FROM users u
         JOIN
     tickets t ON u.custom_id = t.assignee
WHERE t.start_work_at IS NOT NULL
GROUP BY u.custom_id, u.username, u.role
ORDER BY avg_response_time_minutes;`
    );
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports.trends3MonthAgo = async () => {
  const result = await knex.raw(
    `SELECT c.id           AS category_id,
       c.name         AS category_title,
       c.satuan_kerja AS category_field,
       sc.id          AS sub_category_id,
       sc.name        AS sub_category_title,
       COUNT(t.id)    AS total_tickets
FROM tickets t
         JOIN
     sub_categories sc ON t.sub_category_id = sc.id
         JOIN
     categories c ON sc.category_id = c.id
WHERE t.created_at >= NOW() - INTERVAL '3 months'
GROUP BY c.id, c.name, c.satuan_kerja, sc.id, sc.name
ORDER BY total_tickets DESC;`
  );
  return result;
};

module.exports.trends3MonthAgoByWeeks = async () => {
  try {
    const result = await knex.raw(
      `WITH weekly_tickets AS (SELECT DATE_TRUNC('week', t.created_at) AS week_start,
                               c.id                             AS category_id,
                               c.name                           AS category_title,
                               c.satuan_kerja                   AS category_field,
                               sc.id                            AS sub_category_id,
                               sc.name                          AS sub_category_title,
                               COUNT(t.id)                      AS total_tickets
                        FROM tickets t
                                 JOIN
                             sub_categories sc ON t.sub_category_id = sc.id
                                 JOIN
                             categories c ON sc.category_id = c.id
                        WHERE t.created_at >= NOW() - INTERVAL '3 months'
                        GROUP BY week_start, c.id, c.name, c.satuan_kerja, sc.id, sc.name)
SELECT week_start,
       category_id,
       category_title,
       category_field,
       sub_category_id,
       sub_category_title,
       SUM(total_tickets) OVER (PARTITION BY sub_category_id ORDER BY week_start) AS weekly_ticket_count
FROM weekly_tickets
ORDER BY week_start, category_id, sub_category_id;`
    );
  } catch (error) {
    console.log(error);
  }
};

// kepuasan pelanggan
module.exports.customersSatisfactionsByCategory = async () => {};
module.exports.customersSatisfactionsByTimeRange = async () => {};
module.exports.customersSatisfactionsByTicketPriority = async () => {};
module.exports.customersSatisfactionsByStatus = async () => {};
