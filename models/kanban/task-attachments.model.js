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

  // Get all attachments for a project with pagination and filters
  static async getByProject({ projectId, page = 1, limit = 20, search = "", type = "" }) {
    const offset = (page - 1) * limit;

    // Build base conditions
    const buildConditions = (query) => {
      query = query
        .join("kanban.tasks", "kanban.task_attachments.task_id", "kanban.tasks.id")
        .where("kanban.tasks.project_id", projectId);

      // Apply search filter
      if (search) {
        query = query.where((builder) => {
          builder
            .where("kanban.task_attachments.filename", "ilike", `%${search}%`)
            .orWhere("kanban.tasks.title", "ilike", `%${search}%`)
            .orWhere("kanban.tasks.task_number", "ilike", `%${search}%`);
        });
      }

      // Apply type filter
      if (type) {
        if (type === "file") {
          query = query.where((builder) => {
            builder
              .where("kanban.task_attachments.attachment_type", "file")
              .orWhereNull("kanban.task_attachments.attachment_type");
          });
        } else if (type === "link") {
          query = query.where("kanban.task_attachments.attachment_type", "link");
        }
      }

      return query;
    };

    // Get total count (separate query)
    let countQuery = KanbanTaskAttachment.query();
    countQuery = buildConditions(countQuery);
    const totalResult = await countQuery.count("kanban.task_attachments.id as count").first();
    const total = parseInt(totalResult?.count) || 0;

    // Get data with pagination
    let dataQuery = KanbanTaskAttachment.query();
    dataQuery = buildConditions(dataQuery);
    const attachments = await dataQuery
      .select(
        "kanban.task_attachments.*",
        "kanban.tasks.title as task_title",
        "kanban.tasks.task_number"
      )
      .withGraphFetched("uploader(simpleWithImage)")
      .orderBy("kanban.task_attachments.created_at", "desc")
      .limit(limit)
      .offset(offset);

    return {
      data: attachments,
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = KanbanTaskAttachment;

