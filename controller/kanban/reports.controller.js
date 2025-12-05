const { handleError } = require("@/utils/helper/controller-helper");
const KanbanProject = require("@/models/kanban/projects.model");
const KanbanTask = require("@/models/kanban/tasks.model");
const KanbanColumn = require("@/models/kanban/columns.model");
const KanbanTaskActivity = require("@/models/kanban/task-activities.model");
const KanbanTimeEntry = require("@/models/kanban/time-entries.model");
const KanbanProjectMember = require("@/models/kanban/project-members.model");
const KanbanProjectWatcher = require("@/models/kanban/project-watchers.model");

/**
 * Get project overview/dashboard
 */
const getProjectOverview = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;

    // Check access (member or watcher with can_view_reports)
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    const canViewReports = await KanbanProjectWatcher.canViewReports(projectId, userId);

    if (!isMember && !canViewReports) {
      return res.status(403).json({ message: "Anda tidak memiliki akses untuk melihat report" });
    }

    // Get columns with task count
    const columns = await KanbanColumn.query()
      .where("project_id", projectId)
      .select("kanban.columns.*")
      .select(
        KanbanColumn.relatedQuery("tasks").count().as("task_count")
      )
      .orderBy("position", "asc");

    // Get task statistics
    const taskStats = await KanbanTask.query()
      .where("project_id", projectId)
      .select(
        KanbanTask.raw("COUNT(*) as total_tasks"),
        KanbanTask.raw("COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_tasks"),
        KanbanTask.raw("COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND completed_at IS NULL) as overdue_tasks"),
        KanbanTask.raw("COUNT(*) FILTER (WHERE due_date = CURRENT_DATE AND completed_at IS NULL) as due_today"),
        KanbanTask.raw("SUM(estimated_hours) as total_estimated_hours"),
        KanbanTask.raw("SUM(actual_hours) as total_actual_hours")
      )
      .first();

    // Get priority distribution
    const priorityStats = await KanbanTask.query()
      .where("project_id", projectId)
      .whereNull("completed_at")
      .select("priority")
      .count("* as count")
      .groupBy("priority");

    // Calculate completion rate
    const completionRate =
      taskStats.total_tasks > 0
        ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100)
        : 0;

    res.json({
      columns,
      stats: {
        total_tasks: parseInt(taskStats.total_tasks) || 0,
        completed_tasks: parseInt(taskStats.completed_tasks) || 0,
        overdue_tasks: parseInt(taskStats.overdue_tasks) || 0,
        due_today: parseInt(taskStats.due_today) || 0,
        completion_rate: completionRate,
        total_estimated_hours: parseFloat(taskStats.total_estimated_hours) || 0,
        total_actual_hours: parseFloat(taskStats.total_actual_hours) || 0,
      },
      priority_distribution: priorityStats,
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get member activity report
 */
const getMemberReport = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { start_date, end_date } = req?.query;

    // Check access
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    const canViewReports = await KanbanProjectWatcher.canViewReports(projectId, userId);

    if (!isMember && !canViewReports) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Get activity summary by member
    const activitySummary = await KanbanTaskActivity.getMemberActivitySummary(
      projectId,
      start_date,
      end_date
    );

    // Get time by member
    const timeSummary = await KanbanTimeEntry.getTimeByMember(projectId, {
      startDate: start_date,
      endDate: end_date,
    });

    // Get tasks assigned to each member
    const members = await KanbanProjectMember.query()
      .where("project_id", projectId)
      .withGraphFetched("user(simpleWithImage)");

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const tasks = await KanbanTask.query()
          .where("project_id", projectId)
          .where("assigned_to", member.user_id);

        const completedTasks = tasks.filter((t) => t.completed_at !== null);

        const activity = activitySummary.find(
          (a) => a.user_id === member.user_id
        );
        const time = timeSummary.find((t) => t.user_id === member.user_id);

        return {
          user: member.user,
          role: member.role,
          stats: {
            total_assigned: tasks.length,
            completed: completedTasks.length,
            completion_rate:
              tasks.length > 0
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0,
            activity_count: parseInt(activity?.activity_count) || 0,
            total_hours: parseFloat(time?.total_hours) || 0,
          },
        };
      })
    );

    res.json({
      members: memberStats,
      period: {
        start_date,
        end_date,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get activity log for project
 */
const getActivityLog = async (req, res) => {
  try {
    const { projectId } = req?.query;
    const { page = 1, limit = 50 } = req?.query;

    const result = await KanbanTaskActivity.getByProject(projectId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      activities: result.results,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get time tracking report
 */
const getTimeReport = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { projectId } = req?.query;
    const { start_date, end_date } = req?.query;

    // Check access
    const isMember = await KanbanProjectMember.isMember(projectId, userId);
    const canViewReports = await KanbanProjectWatcher.canViewReports(projectId, userId);

    if (!isMember && !canViewReports) {
      return res.status(403).json({ message: "Anda tidak memiliki akses" });
    }

    // Get summary
    const summary = await KanbanTimeEntry.getProjectTimeSummary(projectId, {
      startDate: start_date,
      endDate: end_date,
    });

    // Get time by member
    const byMember = await KanbanTimeEntry.getTimeByMember(projectId, {
      startDate: start_date,
      endDate: end_date,
    });

    // Get daily time for chart
    const dailyTime = await KanbanTimeEntry.getDailyTimeForProject(projectId, {
      startDate: start_date,
      endDate: end_date,
    });

    res.json({
      summary: {
        total_hours: parseFloat(summary?.total_hours) || 0,
        tasks_with_time: parseInt(summary?.tasks_with_time) || 0,
        users_logged: parseInt(summary?.users_logged) || 0,
      },
      by_member: byMember.map((m) => ({
        user_id: m.user_id,
        username: m.username,
        image: m.image,
        total_hours: parseFloat(m.total_hours) || 0,
        entry_count: parseInt(m.entry_count) || 0,
      })),
      daily: dailyTime.map((d) => ({
        date: d.date,
        total_hours: parseFloat(d.total_hours) || 0,
      })),
      period: {
        start_date,
        end_date,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get burndown chart data
 */
const getBurndownData = async (req, res) => {
  try {
    const { projectId } = req?.query;
    const { start_date, end_date } = req?.query;

    // Get all tasks in date range
    const tasks = await KanbanTask.query()
      .where("project_id", projectId)
      .where("created_at", ">=", start_date)
      .where("created_at", "<=", end_date)
      .select("id", "created_at", "completed_at", "estimated_hours");

    // Generate daily burndown data
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);
    const burndownData = [];

    let currentDate = new Date(startDateObj);
    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split("T")[0];

      const totalTasks = tasks.filter(
        (t) => new Date(t.created_at) <= currentDate
      ).length;

      const completedTasks = tasks.filter(
        (t) => t.completed_at && new Date(t.completed_at) <= currentDate
      ).length;

      const remainingTasks = totalTasks - completedTasks;

      burndownData.push({
        date: dateStr,
        total: totalTasks,
        completed: completedTasks,
        remaining: remainingTasks,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      burndown: burndownData,
      period: {
        start_date,
        end_date,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getProjectOverview,
  getMemberReport,
  getActivityLog,
  getTimeReport,
  getBurndownData,
};

