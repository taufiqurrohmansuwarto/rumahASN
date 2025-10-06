/**
 * User Activity Logging Service
 * Handles logging of user actions for audit trail
 */

const LogUserActivity = require("@/models/esign/esign-log-user-activity.model");

const { log } = require("@/utils/logger");

/**
 * Log user activity
 * @param {Object} activityData - Activity data
 * @param {String} activityData.user_id - User ID
 * @param {String} activityData.action - Action performed
 * @param {String} activityData.entity_type - Entity type (e.g., 'signature_detail', 'document')
 * @param {String} activityData.entity_id - Entity ID
 * @param {String} activityData.ip_address - User IP address
 * @param {String} activityData.user_agent - User agent string
 * @param {Object} activityData.additional_data - Additional data (JSON)
 * @returns {Promise<Object>} - Created log entry
 */
export const logUserActivity = async (activityData) => {
  try {
    log.info("      [logUserActivity] Logging action:", activityData.action);

    // Prepare log data
    const logData = {
      user_id: activityData.user_id,
      action: activityData.action,
      entity_type: activityData.entity_type || null,
      ip_address: activityData.ip_address || null,
      user_agent: activityData.user_agent || null,
      additional_data: activityData.additional_data || {},
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Add entity_id if provided (supports both integer and string IDs like nanoid)
    if (activityData.entity_id) {
      logData.entity_id = activityData.entity_id;
    }

    const activityLog = await LogUserActivity.query().insert(logData);

    log.info("      [logUserActivity] Success, log ID:", activityLog.id);
    return activityLog;
  } catch (error) {
    log.error("      [logUserActivity] Error:", error.message);
    // Don't throw - logging failure shouldn't break main flow
    return null;
  }
};

/**
 * Log signature action (sign, review, reject, mark)
 * @param {Object} data - Signature action data
 * @returns {Promise<Object>} - Created log entry
 */
export const logSignatureAction = async (data) => {
  const {
    user_id,
    action, // 'sign_document', 'review_document', 'reject_document', 'mark_for_tte'
    signature_detail_id,
    document_id,
    document_title,
    bsre_transaction_id,
    success,
    error_message,
    ip_address,
    user_agent,
    metadata = {},
  } = data;

  return await logUserActivity({
    user_id,
    action,
    entity_type: "signature_detail",
    entity_id: signature_detail_id || null,
    bsre_transaction_id,
    ip_address,
    user_agent,
    additional_data: {
      document_id,
      document_title,
      bsre_transaction_id,
      success,
      error_message,
      ...metadata,
    },
  });
};

/**
 * Log document action (create, upload, delete, view)
 * @param {Object} data - Document action data
 * @returns {Promise<Object>} - Created log entry
 */
export const logDocumentAction = async (data) => {
  const {
    user_id,
    action, // 'create_document', 'upload_document', 'delete_document', 'view_document'
    document_id,
    document_title,
    success,
    error_message,
    ip_address,
    user_agent,
    metadata = {},
  } = data;

  return await logUserActivity({
    user_id,
    action,
    entity_type: "document",
    entity_id: document_id,
    ip_address,
    user_agent,
    additional_data: {
      document_title,
      success,
      error_message,
      ...metadata,
    },
  });
};

/**
 * Log signature request action (create, cancel, complete)
 * @param {Object} data - Signature request action data
 * @returns {Promise<Object>} - Created log entry
 */
export const logSignatureRequestAction = async (data) => {
  const {
    user_id,
    action, // 'create_signature_request', 'cancel_signature_request', 'complete_signature_request'
    request_id,
    document_id,
    document_title,
    request_type,
    signers_count,
    success,
    error_message,
    ip_address,
    user_agent,
    metadata = {},
  } = data;

  return await logUserActivity({
    user_id,
    action,
    entity_type: "signature_request",
    entity_id: request_id,
    ip_address,
    user_agent,
    additional_data: {
      document_id,
      document_title,
      request_type,
      signers_count,
      success,
      error_message,
      ...metadata,
    },
  });
};

/**
 * Get user activity logs
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - User activity logs with pagination
 */
export const getUserActivityLogs = async (userId, filters = {}) => {
  const { page = 1, limit = 20, action = null } = filters;

  let query = LogUserActivity.query().where("user_id", userId);

  if (action) {
    query = query.where("action", action);
  }

  const result = await query
    .orderBy("created_at", "desc")
    .page(parseInt(page) - 1, parseInt(limit));

  return {
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.total,
      totalPages: Math.ceil(result.total / parseInt(limit)),
    },
  };
};

/**
 * Get activity logs for an entity
 * @param {String} entityType - Entity type
 * @param {String} entityId - Entity ID
 * @returns {Promise<Array>} - Activity logs
 */
export const getEntityActivityLogs = async (entityType, entityId) => {
  const logs = await LogUserActivity.query()
    .where("entity_type", entityType)
    .where("entity_id", entityId)
    .orderBy("created_at", "desc");

  return logs;
};
