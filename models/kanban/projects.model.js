const { Model } = require("objection");
const knex = require("../../db");
const { nanoid } = require("nanoid");

Model.knex(knex);

class KanbanProject extends Model {
  static get tableName() {
    return "kanban.projects";
  }

  $beforeInsert() {
    this.id = nanoid();
  }

  static get modifiers() {
    return {
      simpleSelect(query) {
        query.select("id", "name", "icon", "color", "visibility", "created_at");
      },
    };
  }

  static get relationMappings() {
    const User = require("@/models/users.model");
    const KanbanProjectMember = require("@/models/kanban/project-members.model");
    const KanbanProjectWatcher = require("@/models/kanban/project-watchers.model");
    const KanbanColumn = require("@/models/kanban/columns.model");
    const KanbanTask = require("@/models/kanban/tasks.model");
    const KanbanLabel = require("@/models/kanban/labels.model");

    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: "kanban.projects.created_by",
          to: "users.custom_id",
        },
      },
      members: {
        relation: Model.HasManyRelation,
        modelClass: KanbanProjectMember,
        join: {
          from: "kanban.projects.id",
          to: "kanban.project_members.project_id",
        },
      },
      watchers: {
        relation: Model.HasManyRelation,
        modelClass: KanbanProjectWatcher,
        join: {
          from: "kanban.projects.id",
          to: "kanban.project_watchers.project_id",
        },
      },
      columns: {
        relation: Model.HasManyRelation,
        modelClass: KanbanColumn,
        join: {
          from: "kanban.projects.id",
          to: "kanban.columns.project_id",
        },
      },
      tasks: {
        relation: Model.HasManyRelation,
        modelClass: KanbanTask,
        join: {
          from: "kanban.projects.id",
          to: "kanban.tasks.project_id",
        },
      },
      labels: {
        relation: Model.HasManyRelation,
        modelClass: KanbanLabel,
        join: {
          from: "kanban.projects.id",
          to: "kanban.labels.project_id",
        },
      },
    };
  }

  // Static method untuk create project dengan default columns
  static async createWithDefaults({
    name,
    description,
    icon,
    color,
    visibility,
    createdBy,
  }) {
    const trx = await KanbanProject.startTransaction();

    try {
      // 1. Create project
      const project = await KanbanProject.query(trx).insert({
        name,
        description,
        icon: icon || "📋",
        color: color || "#3B82F6",
        visibility: visibility || "private",
        created_by: createdBy,
      });

      // 2. Create default columns (Bahasa Indonesia - Instansi Pemerintah)
      const KanbanColumn = require("@/models/kanban/columns.model");
      const defaultColumns = [
        {
          name: "Rencana",
          color: "#6B7280",
          position: 0,
          is_done_column: false,
        },
        {
          name: "Penugasan",
          color: "#3B82F6",
          position: 1,
          is_done_column: false,
        },
        {
          name: "Pelaksanaan",
          color: "#F59E0B",
          position: 2,
          is_done_column: false,
        },
        {
          name: "Pemeriksaan",
          color: "#8B5CF6",
          position: 3,
          is_done_column: false,
        },
        {
          name: "Selesai",
          color: "#10B981",
          position: 4,
          is_done_column: true,
        },
      ];

      for (const col of defaultColumns) {
        await KanbanColumn.query(trx).insert({
          project_id: project.id,
          ...col,
        });
      }

      // 3. Add creator as owner member
      const KanbanProjectMember = require("@/models/kanban/project-members.model");
      await KanbanProjectMember.query(trx).insert({
        project_id: project.id,
        user_id: createdBy,
        role: "owner",
      });

      await trx.commit();
      return project;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get projects accessible by user (as member or watcher)
  static async getAccessibleProjects(userId) {
    return KanbanProject.query()
      .where((builder) => {
        builder
          .whereExists(
            KanbanProject.relatedQuery("members").where("user_id", userId)
          )
          .orWhereExists(
            KanbanProject.relatedQuery("watchers").where("user_id", userId)
          );
      })
      .where("is_archived", false)
      .withGraphFetched("[creator(simpleWithImage), members, columns]")
      .orderBy("created_at", "desc");
  }
}

module.exports = KanbanProject;
