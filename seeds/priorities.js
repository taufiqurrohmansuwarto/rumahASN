/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("priorities").del();
  await knex("priorities").insert([
    {
      name: "RENDAH",
      color: "#00FF00",
    },
    {
      name: "SEDANG",
      color: "#FFFF00",
    },
    {
      name: "TINGGI",
      color: "#FF0000",
    },
  ]);
};
