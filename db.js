const setting = require("./knexfile");
const knex = require("knex")(setting.development);
module.exports = knex;
