/**
 * BSrE Integration Logging Service
 * Handles logging of all BSrE API interactions for audit trail
 */

const LogBsreIntegration = require("@/models/esign/esign-log-bsre-integration.model");

const { log } = require("@/utils/logger");

/**
 * Log BSrE API interaction
 * @param {Object} logData - Log data
 * @param {String} logData.transaction_id - BSrE transaction ID reference (optional)
 * @param {String} logData.action - Action performed (e.g., 'sign_document', 'verify_certificate')
 * @param {String} logData.endpoint - API endpoint called
 * @param {String} logData.http_method - HTTP method (POST, GET, etc.)
 * @param {Number} logData.http_status - HTTP status code
 * @param {Object} logData.request_payload - Request payload sent to BSrE
 * @param {Object} logData.response_payload - Response received from BSrE
 * @param {String} logData.error_detail - Error detail if any
 * @param {Number} logData.response_time_ms - Response time in milliseconds
 * @returns {Promise<Object>} - Created log entry
 */
export const logBsreInteraction = async (logData) => {
  try {
    log.info("      [logBsreInteraction] Attempting to log with transaction_id:", logData.transaction_id);

    // Prepare log data, exclude transaction_id if it causes FK constraint issue
    const logPayload = {
      action: logData.action,
      endpoint: logData.endpoint,
      http_method: logData.http_method,
      http_status: logData.http_status,
      request_payload: logData.request_payload || {},
      response_payload: logData.response_payload || {},
      error_detail: logData.error_detail || null,
      response_time_ms: logData.response_time_ms || null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Only add transaction_id if it's provided
    // If FK constraint fails, we'll skip it
    if (logData.transaction_id) {
      logPayload.transaction_id = logData.transaction_id;
    }

    const bsreLog = await LogBsreIntegration.query().insert(logPayload);
    log.info("      [logBsreInteraction] Success, log ID:", bsreLog.id);

    return bsreLog;
  } catch (error) {
    log.error("      [logBsreInteraction] Error:", error.message);

    // If FK constraint error, try again without transaction_id
    if (error.message.includes("foreign key constraint") || error.message.includes("violates")) {
      log.info("      [logBsreInteraction] FK constraint error, retrying without transaction_id...");
      try {
        const logPayloadWithoutFK = {
          action: logData.action,
          endpoint: logData.endpoint,
          http_method: logData.http_method,
          http_status: logData.http_status,
          request_payload: logData.request_payload || {},
          response_payload: logData.response_payload || {},
          error_detail: logData.error_detail || null,
          response_time_ms: logData.response_time_ms || null,
          created_at: new Date(),
          updated_at: new Date(),
          // No transaction_id
        };

        const bsreLogRetry = await LogBsreIntegration.query().insert(logPayloadWithoutFK);
        log.info("      [logBsreInteraction] Success without FK, log ID:", bsreLogRetry.id);
        return bsreLogRetry;
      } catch (retryError) {
        log.error("      [logBsreInteraction] Retry failed:", retryError.message);
        return null;
      }
    }

    // Don't throw - logging failure shouldn't break main flow
    return null;
  }
};

/**
 * Wrapper function for BSrE API calls with automatic logging
 * @param {Function} apiCall - Async function that makes the BSrE API call
 * @param {Object} logMetadata - Metadata for logging
 * @param {String} logMetadata.transaction_id - Transaction ID
 * @param {String} logMetadata.action - Action being performed
 * @param {String} logMetadata.endpoint - Endpoint being called
 * @param {String} logMetadata.http_method - HTTP method
 * @param {Object} logMetadata.request_payload - Request payload
 * @returns {Promise<Object>} - API call result
 */
export const callBsreWithLogging = async (apiCall, logMetadata) => {
  const startTime = Date.now();
  let result = null;
  let error = null;

  try {
    result = await apiCall();
    const responseTime = Date.now() - startTime;

    // Log successful call
    await logBsreInteraction({
      transaction_id: logMetadata.transaction_id,
      action: logMetadata.action,
      endpoint: logMetadata.endpoint,
      http_method: logMetadata.http_method,
      http_status: 200,
      request_payload: logMetadata.request_payload,
      response_payload: result,
      error_detail: null,
      response_time_ms: responseTime,
    });

    return result;
  } catch (err) {
    error = err;
    const responseTime = Date.now() - startTime;

    // Log failed call
    await logBsreInteraction({
      transaction_id: logMetadata.transaction_id,
      action: logMetadata.action,
      endpoint: logMetadata.endpoint,
      http_method: logMetadata.http_method,
      http_status: err?.response?.status || 500,
      request_payload: logMetadata.request_payload,
      response_payload: err?.response?.data || {},
      error_detail: err?.message || "Unknown error",
      response_time_ms: responseTime,
    });

    throw error;
  }
};

/**
 * Get BSrE logs for a transaction
 * @param {String} transactionId - Transaction ID
 * @returns {Promise<Array>} - Log entries
 */
export const getBsreLogs = async (transactionId) => {
  const logs = await LogBsreIntegration.query()
    .where("transaction_id", transactionId)
    .orderBy("created_at", "desc");

  return logs;
};