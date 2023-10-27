/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("cc_meetings", (table) => {
    table.integer("max_participants").defaultTo(0);
    table.time("start_hours").defaultTo("00:00:00");
    table.time("end_hours").defaultTo("00:00:00");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};
