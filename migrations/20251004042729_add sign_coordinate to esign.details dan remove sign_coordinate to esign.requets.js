/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("esign")
    .alterTable("signature_details", function (table) {
      table.jsonb("sign_coordinate").defaultTo([]);
    })
    .then(() => {
      return knex.schema
        .withSchema("esign")
        .alterTable("signature_requests", function (table) {
          table.dropColumn("sign_coordinate");
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
