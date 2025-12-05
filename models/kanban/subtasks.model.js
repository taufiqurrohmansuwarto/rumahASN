const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanSubtask extends Model {
  static get tableName() {
    return "kanban.subtasks";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const KanbanTask = require("@/models/kanban/tasks.model");

    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.subtasks.task_id",
          to: "kanban.tasks.id",
        },
      },
      completed_by_user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.subtasks.completed_by",
          to: "users.custom_id",
        },
      },
    };
  }

  // Toggle subtask completion
  async toggle(userId) {
    const isCompleted = !this.is_completed;
    await this.$query().patch({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      completed_by: isCompleted ? userId : null,
    });

    // Log activity on parent task
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    await KanbanTaskActivity.query().insert({
      task_id: this.task_id,
      user_id: userId,
      action: isCompleted ? "subtask_completed" : "subtask_added",
      new_value: { subtask_id: this.id, title: this.title },
    });

    return this.$query();
  }

  // Get subtasks progress for a task
  static async getProgress(taskId) {
    const result = await KanbanSubtask.query()
      .where("task_id", taskId)
      .select(
        KanbanSubtask.raw("COUNT(*) as total"),
        KanbanSubtask.raw("COUNT(*) FILTER (WHERE is_completed = true) as completed")
      )
      .first();

    return {
      total: parseInt(result.total) || 0,
      completed: parseInt(result.completed) || 0,
      percentage:
        result.total > 0
          ? Math.round((result.completed / result.total) * 100)
          : 0,
    };
  }

  // Reorder subtasks
  static async reorder(taskId, subtaskOrders) {
    const trx = await KanbanSubtask.startTransaction();
    try {
      for (const { id, position } of subtaskOrders) {
        await KanbanSubtask.query(trx)
          .patch({ position })
          .where("id", id)
          .where("task_id", taskId);
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = KanbanSubtask;

