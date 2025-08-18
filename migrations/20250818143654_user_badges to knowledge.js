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
      .createTable("user_badges", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .references("custom_id")
          .inTable("users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("badge_id")
          .references("id")
          .inTable("knowledge.badges")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.datetime("awarded_at");
        table.unique(["user_id", "badge_id"]);
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
    await trx.schema.withSchema("knowledge").dropTableIfExists("user_badges");
  });
};
