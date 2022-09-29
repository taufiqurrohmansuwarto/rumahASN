/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("tickets_attachments", (table) => {
    table.uuid("id").primary();
    table.uuid("ticket_id");
    table.string("file_name");
    table.string("file_path");
    table.string("file_type");
    table.string("file_size");
    table.string("file_url");
    table.foreign("ticket_id").references("tickets.id");
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
  });
};

/*</void>*
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("tickets_attachments");
};
