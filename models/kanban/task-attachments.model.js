const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanTaskAttachment extends Model {
  static get tableName() {
    return "kanban.task_attachments";
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
          from: "kanban.task_attachments.task_id",
          to: "kanban.tasks.id",
        },
      },
      uploader: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.task_attachments.uploaded_by",
          to: "users.custom_id",
        },
      },
    };
  }

  // Add file attachment to task
  static async addToTask({ taskId, filename, filePath, fileSize, fileType, uploadedBy }) {
    const attachment = await KanbanTaskAttachment.query().insert({
      task_id: taskId,
      filename,
      file_path: filePath,
      file_size: fileSize,
      file_type: fileType,
      attachment_type: "file",
      uploaded_by: uploadedBy,
    });

    // Log activity
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    await KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: uploadedBy,
      action: "attachment_added",
      new_value: { attachment_id: attachment.id, filename },
    });

    return attachment;
  }

  // Add link attachment to task
  static async addLinkToTask({ taskId, url, name, uploadedBy }) {
    const attachment = await KanbanTaskAttachment.query().insert({
      task_id: taskId,
      filename: name || url,
      file_url: url,
      attachment_type: "link",
      uploaded_by: uploadedBy,
    });

    // Log activity
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    await KanbanTaskActivity.query().insert({
      task_id: taskId,
      user_id: uploadedBy,
      action: "link_added",
      new_value: { attachment_id: attachment.id, url },
    });

    return attachment;
  }

  // Get attachments for task
  static async getByTask(taskId) {
    return KanbanTaskAttachment.query()
      .where("task_id", taskId)
      .withGraphFetched("uploader(simpleWithImage)")
      .orderBy("created_at", "desc");
  }

  // Get total attachment size for project
  static async getTotalSizeForProject(projectId) {
    const result = await KanbanTaskAttachment.query()
      .join("kanban.tasks", "kanban.task_attachments.task_id", "kanban.tasks.id")
      .where("kanban.tasks.project_id", projectId)
      .sum("kanban.task_attachments.file_size as total_size")
      .first();

    return parseInt(result?.total_size) || 0;
  }
}

module.exports = KanbanTaskAttachment;

