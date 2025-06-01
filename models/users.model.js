const { Model, raw } = require("objection");
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
      username(query) {
        query.select("custom_id", "username");
      },
      simpleSelect(query) {
        query.select(
          "custom_id",
          "username",
          "image",
          "is_online",
          "group",
          "current_role",
          "info",
          "status_kepegawaian"
        );
      },
      fullSelect(query) {
        query.select(
          "custom_id",
          "username",
          "image",
          "is_online",
          "group",
          "from",
          "role",
          "current_role",
          "info",
          "employee_number"
        );
      },
      simpleNoAvatar(query) {
        query.select("custom_id", "username");
      },
      simpleWithImage(query) {
        query
          .select(
            "users.custom_id",
            "users.username",
            "users.image",
            raw(`string_agg(f->>'name', ' - ') as department`)
          )
          .joinRaw(
            `JOIN LATERAL jsonb_array_elements(users.info->'perangkat_daerah'->'full') AS f ON TRUE`
          )
          .groupBy("users.custom_id", "users.username", "users.image");
      },
    };
  }

  static get relationMappings() {
    const Role = require("./roles.model");
    const WebinarSeriesParticipants = require("@/models/webinar-series-participates.model");
    const AppRole = require("@/models/app_roles.model");

    return {
      webinar_series_participates: {
        relation: Model.HasManyRelation,
        modelClass: WebinarSeriesParticipants,
        join: {
          from: "users.custom_id",
          to: "webinar_series_participates.user_id",
        },
      },
      app_role: {
        relation: Model.BelongsToOneRelation,
        modelClass: AppRole,
        join: {
          from: "users.app_role_id",
          to: "app_roles.id",
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
