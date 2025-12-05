const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanColumn extends Model {
  static get tableName() {
    return "kanban.columns";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const KanbanProject = require("@/models/kanban/projects.model");
    const KanbanTask = require("@/models/kanban/tasks.model");

    return {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanProject,
        join: {
          from: "kanban.columns.project_id",
          to: "kanban.projects.id",
        },
      },
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.columns.id",
          to: "kanban.tasks.column_id",
        },
      },
    };
  }

  // Reorder columns in a project
  static async reorder(projectId, columnOrders) {
    const trx = await KanbanColumn.startTransaction();
    try {
      for (const { id, position } of columnOrders) {
        await KanbanColumn.query(trx)
          .patch({ position })
          .where("id", id)
          .where("project_id", projectId);
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get columns with task count
  static async getColumnsWithTaskCount(projectId) {
    return KanbanColumn.query()
      .where("project_id", projectId)
      .select("kanban.columns.*")
      .select(KanbanColumn.relatedQuery("tasks").count().as("task_count"))
      .orderBy("position", "asc");
  }
}

module.exports = KanbanColumn;
