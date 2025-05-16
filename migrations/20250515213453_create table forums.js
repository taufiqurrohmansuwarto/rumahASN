/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("forums", (table) => {
    table.string("id").primary();
    table.string("name");
    table.text("description");
    table.string("icon_url");
    table.specificType("tags", "text[]");
    table.boolean("is_official").defaultTo(false);
    table.specificType("ai_description_embedding", "float8[]"); // ✅ ganti dari vector
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("forums");
};
