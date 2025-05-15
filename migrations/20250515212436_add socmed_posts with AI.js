/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("socmed_posts", (table) => {
    table.boolean("is_thread").defaultTo(false);
    table.string("thread_title");
    table.string("forum_id");
    table.specificType("tags", "text[]");
    table.boolean("is_answered").defaultTo(false);
    table.text("ai_suggested_reply");
    table.decimal("ai_confidence", 4, 3);
    table.text("ai_summary");
    table.specificType("ai_embedding", "float8[]"); // ✅ ganti dari vector
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("socmed_posts", (table) => {
    table.dropColumn("is_thread");
    table.dropColumn("thread_title");
    table.dropColumn("forum_id");
    table.dropColumn("tags");
    table.dropColumn("is_answered");
    table.dropColumn("ai_suggested_reply");
    table.dropColumn("ai_confidence");
    table.dropColumn("ai_summary");
    table.dropColumn("ai_embedding");
  });
};
