/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `alter table tickets add column stars int;
    alter table tickets add column requester_comment varchar(255);
    `
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(
    `alter table tickets drop column stars;
        alter table tickets drop column requester_comment;
        `
  );
};
