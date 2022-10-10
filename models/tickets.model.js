import { nanoid } from "nanoid";

const { Model } = require("objection");
const knex = require("../db");
Model.knex(knex);

class Tickets extends Model {
  // add ticket number using nanoid in beforeinsert

  $beforeInsert() {
    this.ticket_number = nanoid(5);
  }

  static get tableName() {
    return "tickets";
  }

  static get relationMappings() {
    const Categories = require("./categories.model");
    const Status = require("./status.model");
    const Priorities = require("./priorities.model");

    return {
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
          from: "tickets.status_id",
          to: "status.id",
        },
      },
      priorities: {
        relation: Model.BelongsToOneRelation,
        modelClass: Priorities,
        join: {
          from: "tickets.priority_id",
          to: "priorities.id",
        },
      },
    };
  }
}

export default Tickets;
