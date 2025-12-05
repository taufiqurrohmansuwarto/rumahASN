const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanLabel extends Model {
  static get tableName() {
    return "kanban.labels";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const KanbanProject = require("@/models/kanban/projects.model");
    const KanbanTask = require("@/models/kanban/tasks.model");
    const KanbanTaskLabel = require("@/models/kanban/task-labels.model");

    return {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanProject,
        join: {
          from: "kanban.labels.project_id",
          to: "kanban.projects.id",
        },
      },
      task_labels: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTaskLabel,
        join: {
          from: "kanban.labels.id",
          to: "kanban.task_labels.label_id",
        },
      },
      tasks: {
        relation: Model.ManyToManyRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.labels.id",
          through: {
            from: "kanban.task_labels.label_id",
            to: "kanban.task_labels.task_id",
          },
          to: "kanban.tasks.id",
        },
      },
    };
  }

  // Get labels with task count
  static async getLabelsWithCount(projectId) {
    return KanbanLabel.query()
      .where("project_id", projectId)
      .select("kanban.labels.*")
      .select(
        KanbanLabel.relatedQuery("task_labels").count().as("task_count")
      )
      .orderBy("name", "asc");
  }

  // Create default labels for new project (Bahasa Indonesia)
  static async createDefaults(projectId, trx = null) {
    const defaultLabels = [
      { name: "Kesalahan", color: "#EF4444" },
      { name: "Fitur Baru", color: "#3B82F6" },
      { name: "Peningkatan", color: "#10B981" },
      { name: "Dokumentasi", color: "#6B7280" },
      { name: "Mendesak", color: "#F59E0B" },
      { name: "Prioritas", color: "#fa541c" },
    ];

    const queryBuilder = trx ? KanbanLabel.query(trx) : KanbanLabel.query();
    
    for (const label of defaultLabels) {
      await queryBuilder.clone().insert({
        project_id: projectId,
        ...label,
      });
    }
  }
}

module.exports = KanbanLabel;

