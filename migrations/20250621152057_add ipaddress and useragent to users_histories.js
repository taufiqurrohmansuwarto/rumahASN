/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("users_histories", (table) => {
    table.string("ip_address").nullable();
    table.string("user_agent").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("users_histories", (table) => {
    table.dropColumn("ip_address");
    table.dropColumn("user_agent");
  });
};
