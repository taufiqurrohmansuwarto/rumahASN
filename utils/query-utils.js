const User = require("@/models/users.model");
const Ticket = require("@/models/tickets.model");

const natural = require("natural");
const stopwords = require("natural/lib/natural/util/stopwords_id");
const stemmer = natural.StemmerId;

const preProcessText = (text) => {
  const tokenizer = new natural.WordTokenizer();
  const tokenizedText = tokenizer.tokenize(text);
  const filteredText = tokenizedText.filter(
    (word) => !stopwords?.words?.includes(word)
  );
  const stemmedText = filteredText.map((word) => stemmer.stem(word));
  return stemmedText.join(" ");
};

const knex = User.knex();

module.exports.ticketRecomendationById = async (ticketId, role) => {
  const allTickets = await Ticket.query()
    .select("id", "title")
    .distinctOn("title")
    .whereNot("id", ticketId)
    .andWhere((builder) => {
      if (role === "user") {
        builder.where("is_published", true);
      }
    });

  const currentTicket = await Ticket.query()
    .select("id", "title")
    .findById(ticketId)
    .orderBy("created_at", "desc");

  // create TF-IDF
  const tfidf = new natural.TfIdf();

  const preprocessedTitles = allTickets.map((ticket) =>
    preProcessText(ticket.title)
  );

  // calculate usign TF-IDF

  preprocessedTitles.forEach((title) => {
    tfidf.addDocument(title);
  });

  let distance = [];

  tfidf.tfidfs(preProcessText(currentTicket.title), (index, measure) =>
    distance.push({ index, measure })
  );

  let result = [];

  allTickets.forEach((ticket, index) => {
    result.push({
      id: ticket.id,
      title: ticket.title,
      score: distance[index].measure,
    });
  });

  const recommendations = result
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((ticket) => ({
      id: ticket.id,
      title: ticket.title,
    }));

  return recommendations;
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
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.customerSatisfactionsQuery = async () => {
  try {
    const result = await knex.raw(
      `
      WITH dates AS (SELECT generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 month'), CURRENT_DATE,
                                      '1 month')::date AS month)
SELECT to_char(d.month, 'Month')                                 as month,
       COALESCE(round(AVG(t.stars):: numeric, 2), 0)             AS average_ratings,
       count(t.stars)                                            AS total_ratings,
       COALESCE(SUM(CASE WHEN t.stars = 5 THEN 1 ELSE 0 END), 0) AS five_star_ratings
FROM dates d
         LEFT JOIN
     tickets t ON DATE_TRUNC('month', t.completed_at) = d.month
GROUP BY d.month
ORDER BY d.month ASC;
      `
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.agentsPerformances = async () => {
  try {
    const result = await knex.raw(
      `SELECT u.custom_id                         AS agent_id,
       u.username                          AS agent_username,
       u.image                             as agent_image,
       COALESCE(COUNT(t.id), 0)            AS total_tickets_handled,
       coalesce(count(t.id) filter (where t.status_code = 'DIKERJAKAN'), 0)   as total_tickets_handled_in_progress,
       coalesce(count(t.id) filter (where t.status_code = 'SELESAI'), 0) as total_tickets_handled_done,
       COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (t.start_work_at - t.created_at)) / 60)::numeric, 2),
                0)                         AS avg_response_time_minutes,
       COALESCE(ROUND(AVG(t.stars), 1), 0) AS avg_satisfaction_rating
FROM users u
         LEFT JOIN
     tickets t ON u.custom_id = t.assignee
WHERE u."current_role" IN ('admin', 'agent')
GROUP BY u.custom_id, u.username
ORDER BY total_tickets_handled DESC;`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

// rekomendasi faq berdasarkan judul tiket untuk mempercepat respon
module.exports.recommendationsFaqs = async (title) => {
  const result = await knex.raw(
    `WITH search_query AS (
  SELECT
    plainto_tsquery('indonesian', '${title}') AS query
),
faq_ranking AS (
  SELECT
    faqs.id AS faq_id,
    sub_faqs.id AS sub_faq_id,
    sub_faqs.question,
    sub_faqs.answer,
    ts_rank_cd(
      setweight(to_tsvector('indonesian', faqs.name), 'A') ||
      setweight(to_tsvector('indonesian', faqs.description), 'B') ||
      setweight(to_tsvector('indonesian', sub_faqs.question), 'C') ||
      setweight(to_tsvector('indonesian', sub_faqs.answer), 'D'),
      query
    ) AS rank
  FROM
    faqs
    JOIN sub_faqs ON faqs.id = sub_faqs.faq_id,
    search_query
  WHERE
    (
      to_tsvector('indonesian', faqs.name) ||
      to_tsvector('indonesian', faqs.description) ||
      to_tsvector('indonesian', sub_faqs.question) ||
      to_tsvector('indonesian', sub_faqs.answer)
    ) @@ query
)
SELECT
  faq_id,
  sub_faq_id,
  question,
  answer,
  rank
FROM
  faq_ranking
ORDER BY
  rank DESC
LIMIT 5;`
  );

  return result;
};

module.exports.ticketsStatisticsQuery = async () => {
  try {
    const result = await knex.raw(
      `
    WITH dates AS (SELECT generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 month'), CURRENT_DATE,
                                      '1 month')::date AS month)
SELECT to_char(d.month, 'Month')                                                  as "bulan",
       COALESCE(SUM(CASE WHEN t.status_code = 'DIAJUKAN' THEN 1 ELSE 0 END), 0)   AS "diajukan",
       COALESCE(SUM(CASE WHEN t.status_code = 'DIKERJAKAN' THEN 1 ELSE 0 END), 0) AS "dikerjakan",
       COALESCE(SUM(CASE WHEN t.status_code = 'SELESAI' THEN 1 ELSE 0 END), 0)    AS "selesai",
       COALESCE(COUNT(t.id), 0)                                                   as "total"
FROM dates d
         LEFT JOIN
     tickets t ON DATE_TRUNC('month', t.created_at) = d.month
GROUP BY d.month
ORDER BY d.month ASC;
    `
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

// kepuasan pelanggan
module.exports.customersSatisfactionsByCategory = async () => {};
module.exports.customersSatisfactionsByTimeRange = async () => {};
module.exports.customersSatisfactionsByTicketPriority = async () => {};
module.exports.customersSatisfactionsByStatus = async () => {};

module.exports.getUsersAge = async () => {
  try {
    const result = await knex.raw(
      `SELECT CASE
           WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) BETWEEN 20 AND 29 THEN 'Usia Produktif Awal (20-29)'
           WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) BETWEEN 30 AND 39 THEN 'Usia Produktif Tengah (30-39)'
           WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) BETWEEN 40 AND 49 THEN 'Usia Produktif Lanjut (40-49)'
           WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) BETWEEN 50 AND 56 THEN 'Masa Pra-Pensiun (50-56)'
           WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birthdate)) >= 57 THEN 'Masa Pensiun (>=57)'
           END  AS title,
       COUNT(*) AS value
FROM users
where users."group" != 'GOOGLE' or users."group" != null
GROUP BY title
order by value desc;`
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports.getTotalCaraMasuk = async () => {
  try {
    const result = await knex.raw(`select u."group" as title, count(*) as value
from users u
where u."group" is not null
group by 1`);
    return result;
  } catch (error) {
    console.log(error);
  }
};

// todo tambahkan statistik berdasarkan usia pelanggan yang bertanya 6 bulan terakhir
