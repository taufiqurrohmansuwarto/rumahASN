/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // buat schema knowledge, cek dulu schema nya exist atau tidak
    await trx.schema.raw(`CREATE SCHEMA IF NOT EXISTS knowledge`);

    return trx.schema
      .withSchema("knowledge")
      .createTable("contents", (table) => {
        table.string("id").primary();
        table.string("title");
        table.text("content");
        table
          .string("category_id")
          .references("id")
          .inTable("knowledge.category")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.jsonb("tags");
        table
          .string("author_id")
          .references("custom_id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("status").defaultTo("draft");
        table.integer("views_count").defaultTo(0);
        table.integer("likes_count").defaultTo(0);
        table.integer("comments_count").defaultTo(0);
        table.timestamps(true, true);
      });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    await trx.schema.raw(`DROP TABLE IF EXISTS knowledge.contents`);
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
