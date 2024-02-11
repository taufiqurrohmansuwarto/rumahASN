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
    const User = require("@/models/users.model");

    return {
      users: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: "app_roles.id",
          to: "users.app_role_id",
        },
      },
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
      role_permissions: {
        relation: Model.HasManyRelation,
        modelClass: AppRolePermissions,
        join: {
          from: "app_roles.id",
          to: "app_role_permissions.role_id",
        },
      },
    };
  }
}

module.exports = AppRoles;
