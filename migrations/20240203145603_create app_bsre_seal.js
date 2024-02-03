/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("app_bsre_seal", (table) => {
    table.increments("id").primary();
    table.datetime("expired_at");
    table.string("totp_activation_code");
    table.string("id_subscriber");
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("app_bsre_seal");
};
