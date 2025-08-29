/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("user_mission_progress", (table) => {
      table.integer("progress_count").defaultTo(0);
      table.text("period_key").nullable();
      table.timestamp("last_progress_at").nullable();
      table.timestamp("last_claimed_at").nullable();
      table.integer("claims_this_period").defaultTo(0);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("knowledge")
    .alterTable("user_mission_progress", (table) => {
      table.dropColumn("progress_count");
      table.dropColumn("period_key");
      table.dropColumn("last_progress_at");
      table.dropColumn("last_claimed_at");
      table.dropColumn("claims_this_period");
    });
};
