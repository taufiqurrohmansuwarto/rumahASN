const { Model } = require("objection");
const { nanoid } = require("nanoid");

class KanbanTaskAssignee extends Model {
  static get tableName() {
    return "kanban.task_assignees";
  }

  static get idColumn() {
    return "id";
  }

  $beforeInsert() {
    this.id = this.id || nanoid();
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
    this.assigned_at = this.assigned_at || new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  static get relationMappings() {
    const KanbanTask = require("./tasks.model");
    const User = require("../users.model");

    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.task_assignees.task_id",
          to: "kanban.tasks.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.task_assignees.user_id",
          to: "users.custom_id",
        },
      },
      assignedByUser: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.task_assignees.assigned_by",
          to: "users.custom_id",
        },
      },
    };
  }

  // Static methods

  /**
   * Get all assignees for a task
   */
  static async getByTaskId(taskId) {
    return this.query()
      .where("task_id", taskId)
      .withGraphFetched("[user(simpleSelect)]")
      .modifiers({
        simpleSelect(builder) {
          builder.select("custom_id", "username", "image");
        },
      })
      .orderBy("assigned_at", "asc");
  }

  /**
   * Add assignee to task
   */
  static async addAssignee({ taskId, userId, assignedBy }) {
    // Check if already assigned
    const existing = await this.query()
      .where("task_id", taskId)
      .where("user_id", userId)
      .first();

    if (existing) {
      return existing;
    }

    return this.query().insert({
      task_id: taskId,
      user_id: userId,
      assigned_by: assignedBy,
    });
  }

  /**
   * Remove assignee from task
   */
  static async removeAssignee({ taskId, userId }) {
    return this.query()
      .where("task_id", taskId)
      .where("user_id", userId)
      .delete();
  }

  /**
   * Sync assignees - replace all assignees with new list
   */
  static async syncAssignees({ taskId, userIds, assignedBy }) {
    const trx = await Model.startTransaction();

    try {
      // Remove all existing assignees
      await this.query(trx).where("task_id", taskId).delete();

      // Add new assignees
      if (userIds && userIds.length > 0) {
        const assignees = userIds.map((userId) => ({
          id: nanoid(),
          task_id: taskId,
          user_id: userId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        await this.query(trx).insert(assignees);
      }

      await trx.commit();

      // Return updated assignees
      return this.getByTaskId(taskId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  /**
   * Get tasks assigned to user
   */
  static async getTasksByUserId(userId) {
    return this.query()
      .where("user_id", userId)
      .withGraphFetched("[task.[column, project, labels]]")
      .orderBy("assigned_at", "desc");
  }
}

module.exports = KanbanTaskAssignee;

