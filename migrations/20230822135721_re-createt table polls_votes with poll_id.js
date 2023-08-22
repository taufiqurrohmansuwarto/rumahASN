/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("polls_votes", (table) => {
    table.integer("poll_id").notNullable();
    table.integer("answer_id").notNullable();
    table.string("user_id").notNullable();
    table
      .foreign("poll_id")
      .references("polls.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("answer_id")
      .references("polls_answers.id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");
    table
      .foreign("user_id")
      .references("users.custom_id")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.primary(["poll_id", "user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("polls_votes");
};
