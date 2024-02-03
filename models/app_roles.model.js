const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class AppRoles extends Model {
  static get tableName() {
    return "app_roles";
  }

  static get relationMappings() {
    const AppRolePermissions = require("./app_role_permissions.model");
    const AppPermissions = require("./app_permissions.model");

    return {
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: AppPermissions,
        join: {
          from: "app_roles.id",
          through: {
            from: "app_role_permissions.role_id",
            to: "app_role_permissions.permission_id",
          },
          to: "app_permissions.id",
        },
      },
    };
  }
}

module.exports = AppRoles;
