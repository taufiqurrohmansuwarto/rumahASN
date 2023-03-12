const uuid = require("uuid");
const { Model } = require("objection");
const knex = require("../db");
const { customAlphabet } = require("nanoid");


Model.knex(knex);

class Tickets extends Model {
  // add ticket number using nanoid in beforeinsert

  $beforeInsert() {
    const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);
    this.ticket_number = nanoid();
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
    const SubCategories = require("../models/sub-categories.model");
    const Comments = require('../models/tickets_comments_customers.model');

    return {
      comments: {
        relation: Model.HasManyRelation,
        modelClass: Comments,
        join: {
          from: "tickets.id",
          to: "tickets_comments_customers.ticket_id",
        }
      },
      sub_category: {
        relation: Model.BelongsToOneRelation,
        modelClass: SubCategories,
        join: {
          from: "tickets.sub_category_id",
          to: "sub_categories.id",
        },
      },
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
