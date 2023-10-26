/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users_skills", (table) => {
    table.increments("id").primary();
    table.integer("skill_id");
    table.string("user_id");
    table.foreign("skill_id").references("skills.id");
    table.foreign("user_id").references("users.custom_id");
    table.unique(["skill_id", "user_id"]);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
