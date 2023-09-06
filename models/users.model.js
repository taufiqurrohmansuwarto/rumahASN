const { Model } = require("objection");
const knex = require("../db");

Model.knex(knex);

class User extends Model {
  static get tableName() {
    return "users";
  }

  static get idColumn() {
    return "custom_id";
  }

  static get modifiers() {
    return {
      simpleSelect(query) {
        query.select(
          "custom_id",
          "username",
          "image",
          "is_online",
          "group",
          "current_role",
          "info"
          // "employee_number"
        );
      },
      fullSelect(query) {
        query.select(
          "custom_id",
          "username",
          "image",
          "is_online",
          "group",
          "current_role",
          "info",
          "employee_number"
        );
      },
      simpleNoAvatar(query) {
        query.select("custom_id", "username");
      },
    };
  }

  static get relationMappings() {
    const Role = require("./roles.model");
    const WebinarSeriesParticipants = require("@/models/webinar-series-participates.model");

    return {
      webinar_series_participates: {
        relation: Model.HasManyRelation,
        modelClass: WebinarSeriesParticipants,
        join: {
          from: "users.custom_id",
          to: "webinar_series_participates.user_id",
        },
      },
      roles: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: "users.current_role",
          to: "roles.name",
        },
      },
    };
  }
}

module.exports = User;
