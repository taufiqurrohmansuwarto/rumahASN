// RASN Naskah Controllers - Index file
// Export all controllers for easy import

const documentsController = require("./documents.controller");
const templatesController = require("./templates.controller");
const preferencesController = require("./preferences.controller");
const reviewsController = require("./reviews.controller");
const adminController = require("./admin.controller");
const uploadController = require("./upload.controller");

module.exports = {
  ...documentsController,
  ...templatesController,
  ...preferencesController,
  ...reviewsController,
  ...adminController,
  ...uploadController,
};

