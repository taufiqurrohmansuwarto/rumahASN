/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("cc_meetings", (table) => {
    table.specificType("participants_type", "text[]");
    table.string("code");
    table.specificType("asn_orgs", "integer[]");
    table.specificType("nonasn_orgs", "integer[]");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("cc_meetings", (table) => {
    table.dropColumn("participants_type");
    table.dropColumn("code");
    table.dropColumn("asn_orgs");
    table.dropColumn("nonasn_orgs");
  });
};
