const setting = require("./knexfile");
const knex = require("knex")(setting);
module.exports = knex;
