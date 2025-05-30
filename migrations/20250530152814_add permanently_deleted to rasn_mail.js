/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .alterTable("email_user_actions", (table) => {
      table.boolean("permanently_deleted").defaultTo(false);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("rasn_mail")
    .alterTable("email_user_actions", (table) => {
      table.dropColumn("permanently_deleted");
    });
};
