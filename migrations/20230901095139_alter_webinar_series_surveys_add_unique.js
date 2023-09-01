/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("webinar_series_surveys", function (table) {
    table.unique([
      "webinar_series_id",
      "webinar_series_surveys_questions_id",
      "user_id",
    ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("webinar_series_surveys", function (table) {
    table.dropUnique([
      "webinar_series_id",
      "webinar_series_surveys_questions_id",
      "user_id",
    ]);
  });
};
