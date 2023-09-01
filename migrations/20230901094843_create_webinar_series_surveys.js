/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("webinar_series_surveys", function (table) {
    table.string("id").primary();
    table.string("webinar_series_id");
    table.string("webinar_series_surveys_questions_id");
    table.string("user_id");

    table.foreign("webinar_series_id").references("webinar_series.id");
    table
      .foreign("webinar_series_surveys_questions_id")
      .references("webinar_series_surveys_questions.id");
    table.foreign("user_id").references("users.custom_id");

    table.string("value");
    table.text("comment");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropSchemaIfExists("webinar_series_surveys");
};
