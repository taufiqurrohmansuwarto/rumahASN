/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("feedbacks", (table) => {
    table.string("user_id").notNullable();
    table.foreign("user_id").references("custom_id").inTable("users");
    table.integer("stars");
    table.string("feedback");
    table.timestamps(true, true);
    table.primary(["user_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("feedbacks");
};
