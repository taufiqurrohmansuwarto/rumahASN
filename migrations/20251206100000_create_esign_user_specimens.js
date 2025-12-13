/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("esign")
    .createTable("user_specimens", function (table) {
      table.string("id").primary();
      table
        .string("user_id")
        .references("custom_id")
        .inTable("public.users")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
      table.string("name", 100); // nama gambar (contoh: "TTD Resmi", "Logo Pribadi")
      table.string("file_path", 500); // path di MinIO
      table.integer("file_size");
      table.boolean("is_active").defaultTo(false); // hanya 1 yang aktif per user
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.withSchema("esign").dropTable("user_specimens");
};

