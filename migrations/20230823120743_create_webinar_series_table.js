/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("webinar_series", function (table) {
    table.string("id").primary().notNullable();

    table.integer("episode").defaultTo(1);
    table.string("name");
    table.text("description");
    table.string("slug");
    table.string("image_url");

    table.timestamp("start_date");
    table.timestamp("end_date");

    table.timestamp("open_registration");
    table.timestamp("close_registration");
    table.string("status").defaultTo("draft");

    table.string("certificate_template");

    table
      .string("created_by")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table
      .string("updated_by")
      .references("custom_id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  knex.schema.dropTable("webinar_series");
};
