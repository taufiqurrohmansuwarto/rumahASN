/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("comments_podcasts", (table) => {
    table.increments("id");
    table.string("podcast_id");
    table.foreign("podcast_id").references("podcasts.id").onDelete("CASCADE");
    table.string("user_id").notNullable();
    table.foreign("user_id").references("users.custom_id").onDelete("CASCADE");
    table.text("comment").notNullable();
    table.boolean("is_edited").defaultTo(false);
    table.timestamps(true, true);
    table.timestamp("deleted_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("comments_podcasts");
};
