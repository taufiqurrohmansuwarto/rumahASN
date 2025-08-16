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
      .createTable("user_interactions", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .references("custom_id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("content_id")
          .references("id")
          .inTable("knowledge.contents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("interaction_type");
        table.text("comment_text");
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
    await trx.schema.raw(`DROP TABLE IF EXISTS knowledge.user_interactions`);
    return trx.schema.raw(`DROP SCHEMA IF EXISTS knowledge CASCADE`);
  });
};
