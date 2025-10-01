/**
 * Dashboard Query Functions
 * Query functions untuk dashboard tabs (Pending, Marked, Rejected, Completed)
 */

const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const SignatureRequests = require("@/models/esign/esign-signature-requests.model");

/**
 * Get pending documents (Tab: Menunggu aksi saya)
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Pending documents with pagination
 */
export const getPendingDocuments = async (userId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  let query = SignatureDetails.query()
    .select([
      "signature_details.*",
      "documents.document_code",
      "documents.title as document_title",
      "signature_requests.request_type",
      "signature_requests.status as request_status",
    ])
    .join(
      "esign.signature_requests as signature_requests",
      "signature_details.request_id",
      "signature_requests.id"
    )
    .join(
      "esign.documents as documents",
      "signature_requests.document_id",
      "documents.id"
    )
    .where("signature_details.user_id", userId)
    .where("signature_details.status", "waiting")
    .where("signature_requests.status", "pending");

  // Check if sequential, pastikan step sebelumnya sudah selesai
  query = query.where((builder) => {
    builder
      .where("signature_requests.request_type", "parallel")
      .orWhereNotExists(
        SignatureDetails.query()
          .alias("sd2")
          .where(
            "sd2.request_id",
            SignatureDetails.raw("signature_details.request_id")
          )
          .where(
            "sd2.sequence_order",
            "<",
            SignatureDetails.raw("signature_details.sequence_order")
          )
          .whereNotIn("sd2.status", ["reviewed", "signed"])
      );
  });

  const result = await query
    .orderBy("signature_details.created_at", "desc")
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
 * Get marked for TTE documents (Tab: Siap TTE Ajudan)
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Marked documents with pagination
 */
export const getMarkedForTteDocuments = async (userId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  const query = SignatureDetails.query()
    .select([
      "signature_details.*",
      "documents.document_code",
      "documents.title as document_title",
      "signature_requests.request_type",
    ])
    .join(
      "esign.signature_requests as signature_requests",
      "signature_details.request_id",
      "signature_requests.id"
    )
    .join(
      "esign.documents as documents",
      "signature_requests.document_id",
      "documents.id"
    )
    .where("signature_details.user_id", userId)
    .where("signature_details.is_marked_for_tte", true)
    .where("signature_details.status", "marked_for_tte");

  const result = await query
    .orderBy("signature_details.marked_at", "desc")
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
 * Get rejected documents (Tab: Ditolak)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Rejected documents with pagination
 */
export const getRejectedDocuments = async (filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  const query = SignatureDetails.query()
    .select([
      "signature_details.*",
      "documents.document_code",
      "documents.title as document_title",
      "users.username as rejected_by_name",
    ])
    .join(
      "esign.signature_requests as signature_requests",
      "signature_details.request_id",
      "signature_requests.id"
    )
    .join(
      "esign.documents as documents",
      "signature_requests.document_id",
      "documents.id"
    )
    .leftJoin("users", "signature_details.user_id", "users.id")
    .where("signature_details.status", "rejected");

  const result = await query
    .orderBy("signature_details.rejected_at", "desc")
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
 * Get completed documents (Tab: Selesai)
 * @param {String} userId - User ID (optional, for user-specific filter)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Completed documents with pagination
 */
export const getCompletedDocuments = async (userId = null, filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  let query = SignatureRequests.query()
    .select([
      "signature_requests.*",
      "documents.document_code",
      "documents.title as document_title",
    ])
    .join(
      "esign.documents as documents",
      "signature_requests.document_id",
      "documents.id"
    )
    .where("signature_requests.status", "completed");

  // If userId provided, filter by user involvement
  if (userId) {
    query = query.where((builder) => {
      builder
        .where("signature_requests.created_by", userId)
        .orWhereExists(
          SignatureDetails.query()
            .where("signature_details.request_id", "signature_requests.id")
            .where("signature_details.user_id", userId)
        );
    });
  }

  const result = await query
    .orderBy("signature_requests.completed_at", "desc")
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
