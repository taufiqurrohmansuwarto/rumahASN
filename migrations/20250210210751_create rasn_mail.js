/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`CREATE SCHEMA IF NOT EXISTS rasn_mail`).then(() => {
    return knex.schema
      .withSchema("rasn_mail")
      .createTable("emails", (table) => {
        table.string("id").primary();
        table.string("thread_id");
        table.string("sender_id");
        table
          .foreign("sender_id")
          .references("users.custom_id")
          .onDelete("CASCADE");
        table.string("subject");
        table.text("content");
        table.boolean("is_draft");
        table.boolean("is_starred");
        table.timestamps(true, true);
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(`DROP SCHEMA IF EXISTS rasn_mail`);
};
