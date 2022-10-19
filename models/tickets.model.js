const { nanoid } = require("nanoid");
const uuid = require("uuid");
const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Tickets extends Model {
  // add ticket number using nanoid in beforeinsert

  $beforeInsert() {
    this.ticket_number = nanoid(5);
    this.id = uuid.v4();
  }

  static get tableName() {
    return "tickets";
  }

  static get relationMappings() {
    const Categories = require("./categories.model");
    const Status = require("./status.model");
    const Priorities = require("./priorities.model");

    const User = require("../models/users.model");

    return {
      agent: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tickets.assignee",
          to: "users.custom_id",
        },
      },
      customer: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tickets.requester",
          to: "users.custom_id",
        },
      },
      admin: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "tickets.chooser",
          to: "users.custom_id",
        },
      },
      categories: {
        relation: Model.BelongsToOneRelation,
        modelClass: Categories,
        join: {
          from: "tickets.category_id",
          to: "categories.id",
        },
      },
      status: {
        relation: Model.BelongsToOneRelation,
        modelClass: Status,
        join: {
          from: "tickets.status_codek",
          to: "status.name",
        },
      },
      priorities: {
        relation: Model.BelongsToOneRelation,
        modelClass: Priorities,
        join: {
          from: "tickets.priority_code",
          to: "priorities.name",
        },
      },
    };
  }
}

module.exports = Tickets;
