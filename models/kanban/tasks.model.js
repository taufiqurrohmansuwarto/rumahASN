const { Model } = require("objection");
const knex = require("../../db");
const { nanoid, customAlphabet } = require("nanoid");

Model.knex(knex);

class KanbanTask extends Model {
  static get tableName() {
    return "kanban.tasks";
  }

  $beforeInsert() {
    this.id = nanoid();
    // Generate task number (akan diupdate dengan prefix project)
    if (!this.task_number) {
      const numGen = customAlphabet("0123456789", 4);
      this.task_number = `TASK-${numGen()}`;
    }
  }

  static get modifiers() {
    return {
      simpleSelect(query) {
        query.select(
          "id",
          "task_number",
          "title",
          "priority",
          "due_date",
          "position",
          "column_id"
        );
      },
      withCounts(query) {
        query
          .select("kanban.tasks.*")
          .select(
            KanbanTask.relatedQuery("subtasks").count().as("subtask_count")
          )
          .select(
            KanbanTask.relatedQuery("subtasks")
              .where("is_completed", true)
              .count()
              .as("completed_subtask_count")
          )
          .select(
            KanbanTask.relatedQuery("comments").count().as("comment_count")
          )
          .select(
            KanbanTask.relatedQuery("attachments")
              .count()
              .as("attachment_count")
          );
      },
    };
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const KanbanProject = require("@/models/kanban/projects.model");
    const KanbanColumn = require("@/models/kanban/columns.model");
    const KanbanSubtask = require("@/models/kanban/subtasks.model");
    const KanbanLabel = require("@/models/kanban/labels.model");
    const KanbanTaskLabel = require("@/models/kanban/task-labels.model");
    const KanbanTaskAttachment = require("@/models/kanban/task-attachments.model");
    const KanbanTaskComment = require("@/models/kanban/task-comments.model");
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
    const KanbanTimeEntry = require("@/models/kanban/time-entries.model");
    const KanbanTaskAssignee = require("@/models/kanban/task-assignees.model");

    return {
      project: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanProject,
        join: {
          from: "kanban.tasks.project_id",
          to: "kanban.projects.id",
        },
      },
      column: {
        relation: Model.BelongsToOneRelation,
        modelClass: KanbanColumn,
        join: {
          from: "kanban.tasks.column_id",
          to: "kanban.columns.id",
        },
      },
      assignee: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.tasks.assigned_to",
          to: "users.custom_id",
        },
      },
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.tasks.created_by",
          to: "users.custom_id",
        },
      },
      subtasks: {
        relation: Model.HasManyRelation,
        modelClass: KanbanSubtask,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.subtasks.task_id",
        },
      },
      task_labels: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTaskLabel,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.task_labels.task_id",
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: KanbanLabel,
        join: {
          from: "kanban.tasks.id",
          through: {
            from: "kanban.task_labels.task_id",
            to: "kanban.task_labels.label_id",
          },
          to: "kanban.labels.id",
        },
      },
      attachments: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTaskAttachment,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.task_attachments.task_id",
        },
      },
      comments: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTaskComment,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.task_comments.task_id",
        },
      },
      activities: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTaskActivity,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.task_activities.task_id",
        },
      },
      time_entries: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTimeEntry,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.time_entries.task_id",
        },
      },
      task_assignees: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTaskAssignee,
        join: {
          from: "kanban.tasks.id",
          to: "kanban.task_assignees.task_id",
        },
      },
      assignees: {
        relation: Model.ManyToManyRelation,
        modelClass: User,
        join: {
          from: "kanban.tasks.id",
          through: {
            from: "kanban.task_assignees.task_id",
            to: "kanban.task_assignees.user_id",
          },
          to: "users.custom_id",
        },
      },
    };
  }

  // Move task to different column and/or position
  static async moveTask(taskId, { columnId, position, userId }) {
    const KanbanColumn = require("@/models/kanban/columns.model");
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");

    const trx = await KanbanTask.startTransaction();
    try {
      const task = await KanbanTask.query(trx).findById(taskId);
      if (!task) throw new Error("Task not found");

      const oldColumnId = task.column_id;
      const oldPosition = task.position;

      // Update task
      await KanbanTask.query(trx)
        .patch({
          column_id: columnId,
          position: position,
        })
        .where("id", taskId);

      // Log activity with column names
      if (oldColumnId !== columnId) {
        // Get column names for better activity log
        const [oldColumn, newColumn] = await Promise.all([
          KanbanColumn.query(trx).findById(oldColumnId).select("name"),
          KanbanColumn.query(trx).findById(columnId).select("name"),
        ]);

        await KanbanTaskActivity.query(trx).insert({
          task_id: taskId,
          user_id: userId,
          action: "moved",
          old_value: JSON.stringify({
            column_id: oldColumnId,
            column_name: oldColumn?.name || "Unknown",
          }),
          new_value: JSON.stringify({
            column_id: columnId,
            column_name: newColumn?.name || "Unknown",
          }),
        });
      }

      await trx.commit();
      return KanbanTask.query().findById(taskId);
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Complete task
  async complete(userId) {
    const KanbanColumn = require("@/models/kanban/columns.model");
    const KanbanTaskActivity = require("@/models/kanban/task-activities.model");

    const trx = await KanbanTask.startTransaction();
    try {
      // Find done column
      const doneColumn = await KanbanColumn.query(trx)
        .where("project_id", this.project_id)
        .where("is_done_column", true)
        .first();

      if (!doneColumn) throw new Error("Done column not found");

      const oldColumnId = this.column_id;

      // Get old column name
      const oldColumn = await KanbanColumn.query(trx)
        .findById(oldColumnId)
        .select("name");

      await this.$query(trx).patch({
        column_id: doneColumn.id,
        completed_at: new Date().toISOString(),
      });

      await KanbanTaskActivity.query(trx).insert({
        task_id: this.id,
        user_id: userId,
        action: "completed",
        old_value: JSON.stringify({
          column_id: oldColumnId,
          column_name: oldColumn?.name || "Unknown",
        }),
        new_value: JSON.stringify({
          column_id: doneColumn.id,
          column_name: doneColumn.name,
        }),
      });

      await trx.commit();
      return this.$query();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get tasks by column
  static async getByColumn(columnId) {
    return KanbanTask.query()
      .where("column_id", columnId)
      .modify("withCounts")
      .withGraphFetched("[assignee(simpleWithImage), labels, subtasks]")
      .orderBy("position", "asc");
  }

  // Get overdue tasks
  static async getOverdueTasks(projectId) {
    return KanbanTask.query()
      .where("project_id", projectId)
      .where("due_date", "<", new Date().toISOString().split("T")[0])
      .whereNull("completed_at")
      .withGraphFetched("[assignee(simpleWithImage), column]")
      .orderBy("due_date", "asc");
  }

  // Get tasks assigned to user
  static async getAssignedToUser(userId, projectId = null) {
    let query = KanbanTask.query()
      .where("assigned_to", userId)
      .whereNull("completed_at")
      .withGraphFetched("[project(simpleSelect), column, labels]")
      .orderBy("due_date", "asc");

    if (projectId) {
      query = query.where("project_id", projectId);
    }

    return query;
  }
}

module.exports = KanbanTask;
