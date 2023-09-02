/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

// id , webinar_series_id, webinar_series_surveys_question_id, user_id, value, comment, created_at, updated_at

exports.up = function (knex) {
  return knex.schema.dropTable("webinar_series_surveys");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
