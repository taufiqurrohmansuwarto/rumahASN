const setting = require("./knexfile");
const knex = require("knex");
const registerService = require("./utils/registerService");

const db = registerService("db", () => knex(setting.development));
module.exports = db;
