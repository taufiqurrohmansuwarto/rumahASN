/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // using raw
  return knex.raw(`
		ALTER TABLE sub_categories
		ADD COLUMN durasi interval
	`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
		ALTER TABLE sub_categories
		DROP COLUMN durasi
	`);
};
