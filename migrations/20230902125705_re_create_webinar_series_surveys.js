/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("webinar_series_surveys", function (table) {
    table.string("id").primary();
    table.string("webinar_series_id");
    table.string("webinar_series_surveys_question_id");
    table.string("user_id");
    table.integer("value");
    table.text("comment");
    table.timestamps(true, true);

    table
      .foreign("webinar_series_id")
      .references("webinar_series.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("webinar_series_surveys_question_id")
      .references("webinar_series_surveys_questions.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.unique([
      "webinar_series_id",
      "webinar_series_surveys_question_id",
      "user_id",
    ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("webinar_series_surveys");
};
