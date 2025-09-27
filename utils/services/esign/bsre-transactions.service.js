/**
 * Esign BSrE Transactions Service
 * Business logic for BSrE integration and transaction management
 */

const BsreTransactions = require("@/models/esign/esign-bsre-transactions.model");
const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const Documents = require("@/models/esign/esign-documents.model");
const LogBsreIntegration = require("@/models/esign/esign-log-bsre-integration.model");

import {
  downloadEsignDocument,
  uploadSignedDocument,
  generateSignedDocumentUrl
} from "@/utils/helper/minio-helper";

// ==========================================
// BSRE TRANSACTION SERVICES
// ==========================================

/**
 * Create BSrE transaction for signing
 * @param {String} signatureDetailId - Signature detail ID
 * @param {String} documentId - Document ID
 * @param {Object} signData - Signing data
 * @param {Object} mc - Minio client
 * @returns {Promise<Object>} - Created transaction
 */
export const createBsreTransaction = async (signatureDetailId, documentId, signData = {}, mc) => {
  const { signed_by_delegate = false, delegate_notes = '' } = signData;

  // Validate signature detail and document
  const signatureDetail = await SignatureDetails.query()
    .findById(signatureDetailId)
    .withGraphFetched('signature_request');

  if (!signatureDetail) {
    throw new Error("Detail tanda tangan tidak ditemukan");
  }

  const document = await Documents.query().findById(documentId);
  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  // Generate BSrE ID
  const bsreId = `BSRE-${new Date().getFullYear()}-${Date.now()}`;

  // Create transaction
  const transaction = await BsreTransactions.query().insert({
    signature_detail_id: signatureDetailId,
    document_id: documentId,
    bsre_id: bsreId,
    original_file: document.file_path,
    signed_by_delegate,
    delegate_notes,
    status: 'pending',
  });

  return transaction;
};

/**
 * Send document to BSrE for signing
 * @param {String} transactionId - Transaction ID
 * @param {Object} userCertificate - User certificate data
 * @param {Object} mc - Minio client
 * @returns {Promise<Object>} - BSrE response
 */
export const sendToBsre = async (transactionId, userCertificate, mc) => {
  const transaction = await BsreTransactions.query()
    .findById(transactionId)
    .withGraphFetched('[signature_detail, document]');

  if (!transaction) {
    throw new Error("Transaksi BSrE tidak ditemukan");
  }

  if (transaction.status !== 'pending') {
    throw new Error("Transaksi sudah diproses sebelumnya");
  }

  try {
    // Download original document
    const documentBuffer = await downloadEsignDocument(mc, transaction.original_file);

    // Prepare BSrE request data
    const requestData = {
      bsre_id: transaction.bsre_id,
      document: documentBuffer,
      certificate: userCertificate,
      signature_position: {
        page: transaction.signature_detail.signature_page || 1,
        x: transaction.signature_detail.signature_x,
        y: transaction.signature_detail.signature_y,
      },
      metadata: {
        document_code: transaction.document.document_code,
        signer_id: transaction.signature_detail.user_id,
        signed_by_delegate: transaction.signed_by_delegate,
      }
    };

    // Log BSrE request
    await logBsreActivity(transactionId, 'sign_request', '/api/sign', 'POST', requestData);

    // TODO: Implement actual BSrE API call
    // For now, simulate BSrE response
    const bsreResponse = await simulateBsreSign(requestData);

    // Update transaction with response
    await BsreTransactions.query().patchAndFetchById(transactionId, {
      request_data: requestData,
      response_data: bsreResponse,
      status: bsreResponse.success ? 'success' : 'failed',
      error_message: bsreResponse.success ? null : bsreResponse.error,
      completed_at: new Date(),
    });

    // Log BSrE response
    await logBsreActivity(transactionId, 'sign_response', '/api/sign', 'POST', bsreResponse, null, 200);

    if (bsreResponse.success) {
      // Save signed document
      await saveSignedDocument(transactionId, bsreResponse.signed_document, mc);
    }

    return bsreResponse;

  } catch (error) {
    // Update transaction with error
    await BsreTransactions.query().patchAndFetchById(transactionId, {
      status: 'failed',
      error_message: error.message,
      completed_at: new Date(),
    });

    // Log error
    await logBsreActivity(transactionId, 'sign_error', '/api/sign', 'POST', null, error.message, 500);

    throw error;
  }
};

/**
 * Check BSrE transaction status
 * @param {String} bsreId - BSrE ID
 * @returns {Promise<Object>} - Status response
 */
export const checkBsreStatus = async (bsreId) => {
  const transaction = await BsreTransactions.query()
    .where('bsre_id', bsreId)
    .first();

  if (!transaction) {
    throw new Error("Transaksi BSrE tidak ditemukan");
  }

  try {
    // TODO: Implement actual BSrE status check API call
    // For now, return current transaction status
    const statusResponse = {
      bsre_id: bsreId,
      status: transaction.status,
      completed_at: transaction.completed_at,
      error_message: transaction.error_message,
    };

    // Log status check
    await logBsreActivity(transaction.id, 'status_check', '/api/status', 'GET', { bsre_id: bsreId }, null, 200);

    return statusResponse;

  } catch (error) {
    // Log error
    await logBsreActivity(transaction.id, 'status_error', '/api/status', 'GET', { bsre_id: bsreId }, error.message, 500);
    throw error;
  }
};

/**
 * Handle BSrE callback
 * @param {Object} callbackData - Callback data from BSrE
 * @param {Object} mc - Minio client
 * @returns {Promise<Object>} - Processed callback result
 */
export const handleBsreCallback = async (callbackData, mc) => {
  const { bsre_id, status, signed_document, error_message } = callbackData;

  const transaction = await BsreTransactions.query()
    .where('bsre_id', bsre_id)
    .first();

  if (!transaction) {
    throw new Error("Transaksi BSrE tidak ditemukan");
  }

  try {
    // Update transaction status
    await BsreTransactions.query().patchAndFetchById(transaction.id, {
      status: status,
      response_data: callbackData,
      error_message: status === 'failed' ? error_message : null,
      completed_at: new Date(),
    });

    if (status === 'success' && signed_document) {
      // Save signed document
      await saveSignedDocument(transaction.id, signed_document, mc);
    }

    // Log callback
    await logBsreActivity(transaction.id, 'callback', '/callback', 'POST', callbackData, null, 200);

    return { success: true, transaction_id: transaction.id };

  } catch (error) {
    // Log callback error
    await logBsreActivity(transaction.id, 'callback_error', '/callback', 'POST', callbackData, error.message, 500);
    throw error;
  }
};

/**
 * Retry failed BSrE transaction
 * @param {String} transactionId - Transaction ID
 * @param {Object} userCertificate - User certificate data
 * @param {Object} mc - Minio client
 * @returns {Promise<Object>} - Retry response
 */
export const retryBsreTransaction = async (transactionId, userCertificate, mc) => {
  const transaction = await BsreTransactions.query().findById(transactionId);

  if (!transaction) {
    throw new Error("Transaksi BSrE tidak ditemukan");
  }

  if (transaction.status !== 'failed') {
    throw new Error("Hanya transaksi yang gagal yang dapat dicoba ulang");
  }

  // Reset transaction status
  await BsreTransactions.query().patchAndFetchById(transactionId, {
    status: 'pending',
    error_message: null,
    completed_at: null,
  });

  // Retry sending to BSrE
  return await sendToBsre(transactionId, userCertificate, mc);
};

// ==========================================
// TRANSACTION QUERY SERVICES
// ==========================================

/**
 * Get BSrE transactions with pagination and filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Transactions with pagination
 */
export const getBsreTransactions = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    bsre_id,
    document_id,
    user_id
  } = filters;

  let query = BsreTransactions.query()
    .select([
      'bsre_transactions.*',
      'documents.document_code',
      'documents.title as document_title'
    ])
    .leftJoin('esign.documents as documents', 'bsre_transactions.document_id', 'documents.id')
    .withGraphFetched('[signature_detail]');

  if (status) {
    query = query.where('bsre_transactions.status', status);
  }

  if (bsre_id) {
    query = query.where('bsre_transactions.bsre_id', 'ilike', `%${bsre_id}%`);
  }

  if (document_id) {
    query = query.where('bsre_transactions.document_id', document_id);
  }

  if (user_id) {
    query = query.whereExists(
      SignatureDetails.query()
        .where('signature_details.id', 'bsre_transactions.signature_detail_id')
        .where('signature_details.user_id', user_id)
    );
  }

  const result = await query
    .orderBy('bsre_transactions.created_at', 'desc')
    .page(parseInt(page) - 1, parseInt(limit));

  return {
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.total,
      totalPages: Math.ceil(result.total / parseInt(limit)),
    }
  };
};

/**
 * Get BSrE transaction by ID
 * @param {String} transactionId - Transaction ID
 * @returns {Promise<Object>} - Transaction details
 */
export const getBsreTransactionById = async (transactionId) => {
  const transaction = await BsreTransactions.query()
    .findById(transactionId)
    .withGraphFetched('[signature_detail, document]');

  if (!transaction) {
    throw new Error("Transaksi BSrE tidak ditemukan");
  }

  return transaction;
};

// ==========================================
// HELPER SERVICES
// ==========================================

/**
 * Save signed document to Minio
 * @param {String} transactionId - Transaction ID
 * @param {String} signedDocumentData - Signed document (base64 or buffer)
 * @param {Object} mc - Minio client
 * @returns {Promise<String>} - Signed document path
 */
export const saveSignedDocument = async (transactionId, signedDocumentData, mc) => {
  const transaction = await BsreTransactions.query()
    .findById(transactionId)
    .withGraphFetched('document');

  if (!transaction) {
    throw new Error("Transaksi BSrE tidak ditemukan");
  }

  // Convert to buffer if needed
  let fileBuffer;
  if (typeof signedDocumentData === 'string') {
    fileBuffer = Buffer.from(signedDocumentData, 'base64');
  } else {
    fileBuffer = signedDocumentData;
  }

  // Generate signed document path
  const originalPath = transaction.original_file;
  const signedPath = originalPath.replace("esign/documents/", "esign/signed/");

  // Upload signed document
  await uploadSignedDocument(
    mc,
    fileBuffer,
    originalPath,
    transaction.id,
    transaction.signature_detail?.user_id
  );

  // Generate file hash
  const crypto = require("crypto");
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Update transaction with signed file info
  await BsreTransactions.query().patchAndFetchById(transactionId, {
    signed_file: signedPath,
    signed_file_hash: fileHash,
  });

  return signedPath;
};

/**
 * Log BSrE integration activity
 * @param {String} transactionId - Transaction ID
 * @param {String} action - Action type
 * @param {String} endpoint - API endpoint
 * @param {String} httpMethod - HTTP method
 * @param {Object} requestPayload - Request data
 * @param {String} errorDetail - Error detail
 * @param {Number} httpStatus - HTTP status code
 * @returns {Promise<Object>} - Log entry
 */
export const logBsreActivity = async (transactionId, action, endpoint, httpMethod, requestPayload = null, errorDetail = null, httpStatus = 200) => {
  const startTime = Date.now();

  const logEntry = await LogBsreIntegration.query().insert({
    transaction_id: transactionId,
    action,
    endpoint,
    http_method: httpMethod,
    http_status: httpStatus,
    request_payload: requestPayload,
    response_payload: null, // Will be updated in actual implementation
    error_detail: errorDetail,
    response_time_ms: Date.now() - startTime,
  });

  return logEntry;
};

/**
 * Simulate BSrE signing (for development/testing)
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} - Simulated response
 */
export const simulateBsreSign = async (requestData) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    return {
      success: true,
      bsre_id: requestData.bsre_id,
      signed_document: requestData.document, // In real implementation, this would be the signed document
      signature_timestamp: new Date().toISOString(),
      certificate_info: {
        subject: "CN=Test User,O=Test Organization",
        issuer: "CN=Test CA,O=Test CA Organization",
        serial_number: "1234567890",
      }
    };
  } else {
    return {
      success: false,
      bsre_id: requestData.bsre_id,
      error: "BSrE signing failed: Certificate validation error",
      error_code: "CERT_INVALID"
    };
  }
};

/**
 * Get BSrE transaction statistics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Statistics
 */
export const getBsreTransactionStats = async (filters = {}) => {
  const { user_id, date_from, date_to } = filters;

  let query = BsreTransactions.query();

  if (user_id) {
    query = query.whereExists(
      SignatureDetails.query()
        .where('signature_details.id', 'bsre_transactions.signature_detail_id')
        .where('signature_details.user_id', user_id)
    );
  }

  if (date_from) {
    query = query.where('bsre_transactions.created_at', '>=', date_from);
  }

  if (date_to) {
    query = query.where('bsre_transactions.created_at', '<=', date_to);
  }

  const stats = await query
    .select('status')
    .groupBy('status')
    .count('* as count');

  const result = {
    total: 0,
    pending: 0,
    success: 0,
    failed: 0,
  };

  stats.forEach(stat => {
    const status = stat.status;
    const count = parseInt(stat.count);
    result[status] = count;
    result.total += count;
  });

  return result;
};