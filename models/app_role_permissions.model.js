const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AppRolePermisions extends Model {
  static get tableName() {
    return "app_role_permissions";
  }

  static get relationMappings() {
    const AppRoles = require("./app_roles.model");
    const AppPermissions = require("./app_permissions.model");

    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: AppRoles,
        join: {
          from: "app_role_permissions.role_id",
          to: "app_roles.id",
        },
      },
      permission: {
        relation: Model.BelongsToOneRelation,
        modelClass: AppPermissions,
        join: {
          from: "app_role_permissions.permission_id",
          to: "app_permissions.id",
        },
      },
    };
  }
}

module.exports = AppRolePermisions;
