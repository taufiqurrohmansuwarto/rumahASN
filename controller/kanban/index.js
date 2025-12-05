// Export all kanban controllers

const projectsController = require("./projects.controller");
const membersController = require("./members.controller");
const columnsController = require("./columns.controller");
const tasksController = require("./tasks.controller");
const commentsController = require("./comments.controller");
const attachmentsController = require("./attachments.controller");
const labelsController = require("./labels.controller");
const timeEntriesController = require("./time-entries.controller");
const reportsController = require("./reports.controller");

module.exports = {
  // Projects
  ...projectsController,
  // Members & Watchers
  ...membersController,
  // Columns
  ...columnsController,
  // Tasks & Subtasks
  ...tasksController,
  // Comments
  ...commentsController,
  // Attachments
  ...attachmentsController,
  // Labels
  ...labelsController,
  // Time Entries
  ...timeEntriesController,
  // Reports
  ...reportsController,
};

