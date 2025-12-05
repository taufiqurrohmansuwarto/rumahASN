const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanTaskLabel extends Model {
  static get tableName() {
    return "kanban.task_labels";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const KanbanTask = require("@/models/kanban/tasks.model");
    const KanbanLabel = require("@/models/kanban/labels.model");

    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.task_labels.task_id",
          to: "kanban.tasks.id",
        },
      },
      label: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanLabel,
        join: {
          from: "kanban.task_labels.label_id",
          to: "kanban.labels.id",
        },
      },
    };
  }

  // Add label to task
  static async addToTask(taskId, labelId, userId) {
    // Check if already exists
    const existing = await KanbanTaskLabel.query()
      .where("task_id", taskId)
      .where("label_id", labelId)
      .first();

    if (existing) return existing;

    const taskLabel = await KanbanTaskLabel.query().insert({
      task_id: taskId,
      label_id: labelId,
    });

    // Log activity
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    const KanbanLabel = require("@/models/kanban/labels.model");
    const label = await KanbanLabel.query().findById(labelId);

    await KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: userId,
      action: "label_added",
      new_value: { label_id: labelId, label_name: label?.name },
    });

    return taskLabel;
  }

  // Remove label from task
  static async removeFromTask(taskId, labelId, userId) {
    const KanbanLabel = require("@/models/kanban/labels.model");
    const label = await KanbanLabel.query().findById(labelId);

    await KanbanTaskLabel.query()
      .where("task_id", taskId)
      .where("label_id", labelId)
      .delete();

    // Log activity
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    await KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: userId,
      action: "label_removed",
      old_value: { label_id: labelId, label_name: label?.name },
    });
  }

  // Sync labels for task (replace all)
  static async syncLabels(taskId, labelIds, userId) {
    const trx = await KanbanTaskLabel.startTransaction();
    try {
      // Get current labels
      const currentLabels = await KanbanTaskLabel.query(trx)
        .where("task_id", taskId)
        .select("label_id");
      const currentLabelIds = currentLabels.map((l) => l.label_id);

      // Labels to add
      const toAdd = labelIds.filter((id) => !currentLabelIds.includes(id));
      // Labels to remove
      const toRemove = currentLabelIds.filter((id) => !labelIds.includes(id));

      // Remove old labels
      if (toRemove.length > 0) {
        await KanbanTaskLabel.query(trx)
          .where("task_id", taskId)
          .whereIn("label_id", toRemove)
          .delete();
      }

      // Add new labels
      for (const labelId of toAdd) {
        await KanbanTaskLabel.query(trx).insert({
          task_id: taskId,
          label_id: labelId,
        });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = KanbanTaskLabel;

