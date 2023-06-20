/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("podcasts_votes", function (table) {
    table.string("podcast_id");
    table.foreign("podcast_id").references("podcasts.id").onDelete("CASCADE");
    table.string("user_id");
    table.foreign("user_id").references("users.custom_id").onDelete("CASCADE");
    table.integer("vote").unsigned().notNullable();
    table.timestamps(true, true);
    table.primary(["podcast_id", "user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("podcasts_votes");
};
