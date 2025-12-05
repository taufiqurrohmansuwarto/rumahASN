const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanTaskComment extends Model {
  static get tableName() {
    return "kanban.task_comments";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
    this.is_edited = true;
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const KanbanTask = require("@/models/kanban/tasks.model");

    return {
      task: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.task_comments.task_id",
          to: "kanban.tasks.id",
        },
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.task_comments.user_id",
          to: "users.custom_id",
        },
      },
    };
  }

  // Add comment to task
  static async addComment({ taskId, userId, content, mentions = [] }) {
    const comment = await KanbanTaskComment.query().insert({
      task_id: taskId,
      user_id: userId,
      content,
      mentions: mentions.length > 0 ? JSON.stringify(mentions) : null,
    });

    // Log activity
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    await KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: userId,
      action: "comment_added",
      new_value: { comment_id: comment.id },
    });

    return comment.$query().withGraphFetched("user(simpleWithImage)");
  }

  // Get comments for task
  static async getByTask(taskId, { page = 1, limit = 20 } = {}) {
    return KanbanTaskComment.query()
      .where("task_id", taskId)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("created_at", "desc")
      .page(page - 1, limit);
  }

  // Update comment
  async updateContent(content, mentions = []) {
    return this.$query().patchAndFetch({
      content,
      mentions: mentions.length > 0 ? JSON.stringify(mentions) : null,
    });
  }

  // Delete comment
  async deleteComment() {
    return this.$query().delete();
  }

  // Get recent comments for project
  static async getRecentByProject(projectId, limit = 10) {
    return KanbanTaskComment.query()
      .join("kanban.tasks", "kanban.task_comments.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .select("kanban.task_comments.*")
      .withGraphFetched("[user(simpleWithImage), task(simpleSelect)]")
      .orderBy("kanban.task_comments.created_at", "desc")
      .limit(limit);
  }
}

module.exports = KanbanTaskComment;

