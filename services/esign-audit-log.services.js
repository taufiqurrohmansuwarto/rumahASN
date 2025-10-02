const LogDocument = require("../models/esign/esign-log-document.model");
const LogUserActivity = require("../models/esign/esign-log-user-activity.model");

/**
 * Log document activity
 * Actions: view, download, print, sign, mark_for_tte, reject, upload, review
 */
const logDocumentActivity = async ({
  documentId,
  userId,
  action,
  fileVersion = null,
  ipAddress = null,
  req = null,
}) => {
  try {
    const logData = {
      document_id: documentId,
      user_id: userId,
      action,
      file_version: fileVersion,
      ip_address: ipAddress || req?.ip || req?.connection?.remoteAddress,
    };

    await LogDocument.query().insert(logData);
  } catch (error) {
    console.error("Error logging document activity:", error);
    // Don't throw error, just log it
  }
};

/**
 * Log user activity
 * Actions: login, upload_document, sign_document, mark_for_tte, reject_document, review_document, download_document, view_document
 */
const logUserActivity = async ({
  userId,
  action,
  entityType = null,
  entityId = null,
  ipAddress = null,
  userAgent = null,
  additionalData = null,
  req = null,
}) => {
  try {
    const logData = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress || req?.ip || req?.connection?.remoteAddress,
      user_agent: userAgent || req?.headers?.["user-agent"],
      additional_data: additionalData,
    };

    await LogUserActivity.query().insert(logData);
  } catch (error) {
    console.error("Error logging user activity:", error);
    // Don't throw error, just log it
  }
};

/**
 * Get document activity logs with pagination
 */
const getDocumentLogs = async ({ documentId, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const query = LogDocument.query()
    .where("document_id", documentId)
    .withGraphFetched("user")
    .orderBy("created_at", "desc");

  const [logs, total] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().resultSize(),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get user activity logs with pagination
 */
const getUserActivityLogs = async ({
  userId,
  action = null,
  page = 1,
  limit = 20,
}) => {
  const offset = (page - 1) * limit;

  let query = LogUserActivity.query()
    .where("user_id", userId)
    .withGraphFetched("user")
    .orderBy("created_at", "desc");

  if (action) {
    query = query.where("action", action);
  }

  const [logs, total] = await Promise.all([
    query.clone().limit(limit).offset(offset),
    query.clone().resultSize(),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all logs for a specific document (both document and user activity)
 */
const getAllDocumentLogs = async ({ documentId, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  // Get document logs
  const documentLogs = await LogDocument.query()
    .where("document_id", documentId)
    .withGraphFetched("user")
    .select("*", LogDocument.raw("'document' as log_type"))
    .orderBy("created_at", "desc");

  // Get user activity logs related to this document
  const userLogs = await LogUserActivity.query()
    .where("entity_type", "document")
    .where("entity_id", documentId)
    .withGraphFetched("user")
    .select("*", LogUserActivity.raw("'user_activity' as log_type"))
    .orderBy("created_at", "desc");

  // Merge and sort by created_at
  const allLogs = [...documentLogs, ...userLogs].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const total = allLogs.length;
  const paginatedLogs = allLogs.slice(offset, offset + limit);

  return {
    data: paginatedLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  logDocumentActivity,
  logUserActivity,
  getDocumentLogs,
  getUserActivityLogs,
  getAllDocumentLogs,
};
