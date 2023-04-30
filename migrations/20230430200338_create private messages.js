/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("private_messages", function (table) {
    table.increments("id");
    table.string("sender_id");
    table.string("receiver_id");
    table.text("message").notNullable();
    table.boolean("is_read").defaultTo(false);

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at");
    table.foreign("sender_id").references("custom_id").inTable("users");
    table.foreign("receiver_id").references("custom_id").inTable("users");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("private_messages");
};
