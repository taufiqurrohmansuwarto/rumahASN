/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .raw(`CREATE SCHEMA IF NOT EXISTS guests_books`)
    .then(() => {
      return knex.schema
        .withSchema("guests_books")
        .createTable("guests", (table) => {
          table.string("id").primary();
          table.string("user_id");
          table
            .foreign("user_id")
            .references("users.custom_id")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
          table.string("name");
          table.string("email");
          table.string("phone");
          table.string("photo");
          table.string("id_card");
          table.string("signature");
          table.timestamps(true, true);
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("guests_books")
    .dropTableIfExists("guests")
    .then(() => {
      return knex.schema.raw("DROP SCHEMA IF EXISTS guests_books CASCADE");
    });
};
