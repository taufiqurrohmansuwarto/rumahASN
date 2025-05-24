/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  //  gunakan transaction untuk menghapus semua table
  return knex.transaction(async (trx) => {
    await trx.schema.withSchema("rasn_mail").dropTable("contacts");
    await trx.schema.withSchema("rasn_mail").dropTable("attachments");
    await trx.schema.withSchema("rasn_mail").dropTable("email_labels");
    await trx.schema.withSchema("rasn_mail").dropTable("labels");
    await trx.schema.withSchema("rasn_mail").dropTable("recipients");
    await trx.schema.withSchema("rasn_mail").dropTable("emails");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  //  gunakan transaction untuk membuat semua table
  return knex.transaction(async (trx) => {
    await trx.schema.withSchema("rasn_mail").createTable("attachments");
    await trx.schema.withSchema("rasn_mail").createTable("contacts");
    await trx.schema.withSchema("rasn_mail").createTable("email_labels");
    await trx.schema.withSchema("rasn_mail").createTable("emails");
    await trx.schema.withSchema("rasn_mail").createTable("labels");
    await trx.schema.withSchema("rasn_mail").createTable("recipients");
  });
};
