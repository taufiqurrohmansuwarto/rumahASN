/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("announcements", (table) => {
    table.increments("id");
    table.string("title").notNullable();
    table.string("content").notNullable();
    table.string("author").notNullable();
    table.foreign("author").references("users.custom_id").onDelete("CASCADE");
    table.boolean("is_active").defaultTo(true);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("announcements");
};
