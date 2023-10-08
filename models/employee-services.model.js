const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class EmployeeServices extends Model {
  static get tableName() {
    return "employee_services";
  }

  static get idColumn() {
    return "id";
  }

  static get relationMappings() {}
}

module.exports = EmployeeServices;
