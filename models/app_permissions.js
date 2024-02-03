const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AppPermissions extends Model {
  static get tableName() {
    return "app_permissions";
  }

  static get relationMappings() {
    const AppRoles = require("./app_roles.model");
    const AppRolePermissions = require("./app_role_permissions.model");

    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: AppRoles,
        join: {
          from: "app_permissions.id",
          through: {
            from: "app_role_permissions.permission_id",
            to: "app_role_permissions.role_id",
          },
          to: "app_roles.id",
        },
      },
    };
  }
}

module.exports = AppPermissions;
