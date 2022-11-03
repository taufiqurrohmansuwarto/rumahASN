/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `alter table tickets_comments_customers
    add column user_id varchar(255) references users (custom_id);
alter table tickets_comments_customers drop column agent_id;
alter table tickets_comments_customers drop column customer_id;`
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  `alter table tickets_comments_customers
    drop column user_id;
    alter table tickets_comments_customers add column agent_id varchar(255) references users (custom_id);
    alter table tickets_comments_customers add column customer_id varchar(255) references users (custom_id);`;
};
