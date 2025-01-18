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

module.exports.getUsersByDepartment = async () => {
  const result = await knex.raw(
    `SELECT
    SUBSTRING(info->'perangkat_daerah'->>'id' FOR 3) AS perangkat_daerah_id,
    get_hierarchy_simaster(SUBSTRING(info->'perangkat_daerah'->>'id' FOR 3)) AS perangkat_daerah,
    COUNT(*) AS total
FROM
    users
GROUP BY
    SUBSTRING(info->'perangkat_daerah'->>'id' FOR 3)
ORDER BY
    total DESC
LIMIT 8;`
  );
  return result.rows;
};

module.exports.getTopDepartmentQuestion = async () => {
  const result = await knex.raw(`WITH recent_tickets AS (
    SELECT
        requester,
        COUNT(*) AS total_tickets
    FROM
        tickets
    WHERE
        created_at >= NOW() - INTERVAL '1 month'
    GROUP BY
        requester
),
users_with_tickets AS (
    SELECT
        SUBSTRING(u.info->'perangkat_daerah'->>'id' FOR 3) AS perangkat_daerah_id,
        COUNT(rt.total_tickets) AS total_tickets
    FROM
        users u
    JOIN
        recent_tickets rt ON u.custom_id = rt.requester
    GROUP BY
        SUBSTRING(u.info->'perangkat_daerah'->>'id' FOR 3)
)
SELECT
    perangkat_daerah_id,
    get_hierarchy_simaster(perangkat_daerah_id) AS perangkat_daerah_name,
    total_tickets
FROM
    users_with_tickets
ORDER BY
    total_tickets DESC
LIMIT 8;`);

  return result?.rows;
};

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
    WITH dates AS (SELECT generate_series(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 month'), CURRENT_DATE,
                                      '1 month')::date AS month)
SELECT to_char(d.month, 'Month YYYY')                                                  as "bulan",
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
module.exports.getReportWebinarSeries = async (webinarSeriesId) => {
  try {
    const result = await knex.raw(
      `
    WITH AbsenceData AS (SELECT u.username,
                            u.email,
                            u.employee_number,
                            u.info,
                            u."group"               as "group",
                            wsp.already_poll,
                            wsp.created_at,
                            ws.title                AS nama_webinar,
                            'hari ke-' || wsa.day || ': ' ||
                            COALESCE('hadir tanggal ' || TO_CHAR(wspa.created_at, 'DD-MM-YYYY HH24:MI'),
                                     'tidak hadir') AS waktu_absen_entry
                     FROM webinar_series_participates wsp
                              JOIN users u ON wsp.user_id = u.custom_id
                              JOIN webinar_series ws ON wsp.webinar_series_id = ws.id
                              LEFT JOIN webinar_series_absence_entries wsa ON ws.id = wsa.webinar_series_id
                              LEFT JOIN webinar_series_participants_absence wspa
                                        ON wsp.user_id = wspa.user_id AND wsa.id = wspa.webinar_series_absence_entry_id
                     WHERE wsp.webinar_series_id = ?),
     CertificateData AS (SELECT u.username,
                                ws.title             AS nama_webinar,
                                CASE
                                    WHEN COUNT(DISTINCT wsa.id) =
                                         COUNT(DISTINCT wspa.webinar_series_absence_entry_id) and
                                         wsp.already_poll = true
                                        THEN 'Ya'
                                    ELSE 'Tidak' END AS dapat_sertifikat
                         FROM webinar_series_participates wsp
                                  JOIN users u ON wsp.user_id = u.custom_id
                                  JOIN webinar_series ws ON wsp.webinar_series_id = ws.id
                                  LEFT JOIN webinar_series_absence_entries wsa ON ws.id = wsa.webinar_series_id
                                  LEFT JOIN webinar_series_participants_absence wspa ON wsp.user_id = wspa.user_id AND
                                                                                        wsa.id =
                                                                                        wspa.webinar_series_absence_entry_id
                         WHERE wsp.webinar_series_id = ?
                         GROUP BY u.username, ws.title, wsp.already_poll)
SELECT ad.username,
       ad.created_at                          as waktu_registrasi,
       cd.nama_webinar                        as nama_webinar,
       ad.already_poll,
       ad.info,
       ad.email,
       ad.employee_number,
       ad.nama_webinar,
       ad.group,
       STRING_AGG(ad.waktu_absen_entry, ', ') AS waktu_absen,
       cd.dapat_sertifikat
FROM AbsenceData ad
         JOIN CertificateData cd ON ad.username = cd.username AND ad.nama_webinar = cd.nama_webinar
GROUP BY ad.username, ad.nama_webinar, cd.dapat_sertifikat, ad.already_poll, ad.info, ad.email, ad.employee_number,
         ad.group, ad.created_at, cd.nama_webinar
ORDER BY ad.username, ad.nama_webinar;
    `,
      [webinarSeriesId, webinarSeriesId]
    );
    return result;
  } catch (e) {
    console.log(e);
  }
};

module.exports.getAggregateAnomali = async () => {
  const tableName = "anomali_23";
  const result = await knex.raw(`  SELECT
      sub_anomali.jenis_anomali_nama,
      sub_repaired.is_repaired,
      COALESCE(COUNT(${tableName}.id), 0) AS value
    FROM
      (SELECT DISTINCT jenis_anomali_nama FROM ${tableName}) AS sub_anomali
    CROSS JOIN
      (VALUES (true), (false)) AS sub_repaired(is_repaired)
    LEFT JOIN
      ${tableName}
    ON
      sub_anomali.jenis_anomali_nama = ${tableName}.jenis_anomali_nama
      AND sub_repaired.is_repaired = ${tableName}.is_repaired
    GROUP BY
      sub_anomali.jenis_anomali_nama, sub_repaired.is_repaired
  `);

  const hasil = result.rows.map((row) => {
    return {
      label: row.jenis_anomali_nama,
      value: parseInt(row.value, 10),
      type: row.is_repaired ? "sudah_diperbaiki" : "belum_diperbaiki",
    };
  });

  return hasil;
};

module.exports.getPerbaikanByUser = async () => {
  const rawQuery = `
  SELECT users.username       AS label,
       COUNT(anomali_23.id) AS value
FROM anomali_23
         JOIN
     users ON anomali_23.user_id = users.custom_id
WHERE anomali_23.is_repaired = true

GROUP BY users.username
order by value desc
limit 10
      `;

  const results = await knex.raw(rawQuery);

  return results.rows.map((row) => ({
    label: row.label,
    value: parseInt(row.value, 10),
  }));
};

module.exports.getQueryChildrenPerangkatDaerah = async (id) => {
  const raw = `WITH RECURSIVE sub_tree AS (
    -- Anchor member: starting point of the recursion
    SELECT "Id", "DiatasanId", "NamaUnor", 1 as level
    FROM ref_siasn_unor
    WHERE "Id" = '${id}'

    UNION ALL

    -- Recursive member: gets the children of the nodes in the previous result set
    SELECT c."Id", c."DiatasanId", c."NamaUnor", p.level + 1
    FROM ref_siasn_unor c
             INNER JOIN sub_tree p ON p."Id" = c."DiatasanId")
SELECT sub_tree.*, d.unor_sekolah, d.duplikasi_unor, d.aktif, d."NSPN",
       ROW_NUMBER() OVER (ORDER BY 
            REGEXP_REPLACE(sub_tree."NamaUnor", '\\s+', '', 'g'), 
            COALESCE(NULLIF(REGEXP_REPLACE(REGEXP_REPLACE(sub_tree."NamaUnor", '\\s+', '', 'g'), '\\D', '', 'g'), '')::INTEGER, 0)
        ) as urutan
FROM sub_tree
LEFT JOIN disparitas_unor d ON sub_tree."Id" = d.id
ORDER BY urutan;`;

  const results = await knex.raw(raw);

  return results.rows;
};

module.exports.getResultPerangkatDaerahXls = async (id) => {
  const raw = `WITH RECURSIVE sub_tree AS (
    -- Anchor member: starting point of the recursion
    SELECT "Id", "DiatasanId", "NamaUnor", 1 as level, "NamaUnor" as display_name, "Id"::varchar(255) as path
    FROM ref_siasn_unor
    WHERE "Id" = '${id}'

    UNION ALL

    -- Recursive member: gets the children of the nodes in the previous result set
    SELECT c."Id", c."DiatasanId", c."NamaUnor", p.level + 1,
           (REPEAT('-', p.level) || ' ' || c."NamaUnor")::varchar(255) as display_name,
           (p.path || '>' || c."Id")::varchar(255) as path
    FROM ref_siasn_unor c
             INNER JOIN sub_tree p ON p."Id" = c."DiatasanId")
SELECT sub_tree.*, d.unor_sekolah, d.duplikasi_unor, d.aktif, d."NSPN", d.description
FROM sub_tree
LEFT JOIN disparitas_unor d ON sub_tree."Id" = d.id
ORDER BY path`;

  const result = await knex.raw(raw);
  return result.rows;
};

module.exports.getUnorSiasnInformation = async (id) => {
  const raw = `WITH RECURSIVE unor_hierarchy AS (
    -- Langkah awal: Mulai dari "Id" tertentu
    SELECT
        "Id",
        "NamaUnor",
        "DiatasanId",
        1 AS level  -- Level awal adalah 1
    FROM
        ref_siasn_unor
    WHERE
        "Id" = '${id}'  -- Ganti dengan ID yang diinginkan

    UNION ALL

    -- Langkah rekursif: Dapatkan data di atasnya
    SELECT
        r."Id",
        r."NamaUnor",
        r."DiatasanId",
        uh.level + 1 AS level  -- Tambahkan level setiap naik hierarki
    FROM
        ref_siasn_unor r
    INNER JOIN
        unor_hierarchy uh
    ON
        r."Id" = uh."DiatasanId"
)
-- Ambil semua data hierarki
SELECT
    STRING_AGG("NamaUnor", ' - ' ORDER BY level ASC) AS hierarchy
FROM
    unor_hierarchy;`;

  const result = await knex.raw(raw);
  return result.rows;
};
