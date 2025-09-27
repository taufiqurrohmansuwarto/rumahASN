/**
 * Esign Signature Details Service
 * Business logic for signature detail management (Core TTE Workflow)
 */

const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
const Documents = require("@/models/esign/esign-documents.model");

// ==========================================
// DASHBOARD TAB SERVICES
// ==========================================

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
      'signature_details.*',
      'documents.document_code',
      'documents.title as document_title',
      'signature_requests.request_type',
      'signature_requests.status as request_status'
    ])
    .join('esign.signature_requests as signature_requests', 'signature_details.request_id', 'signature_requests.id')
    .join('esign.documents as documents', 'signature_requests.document_id', 'documents.id')
    .where('signature_details.user_id', userId)
    .where('signature_details.status', 'waiting')
    .where('signature_requests.status', 'pending');

  // Check if sequential, pastikan step sebelumnya sudah selesai
  query = query.where(builder => {
    builder.where('signature_requests.request_type', 'parallel')
      .orWhereNotExists(
        SignatureDetails.query()
          .alias('sd2')
          .where('sd2.request_id', 'signature_details.request_id')
          .where('sd2.sequence_order', '<', 'signature_details.sequence_order')
          .whereNotIn('sd2.status', ['reviewed', 'signed'])
      );
  });

  const result = await query
    .orderBy('signature_details.created_at', 'desc')
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
 * Get marked for TTE documents (Tab: Siap TTE Ajudan)
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Marked documents with pagination
 */
export const getMarkedForTteDocuments = async (userId, filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  const query = SignatureDetails.query()
    .select([
      'signature_details.*',
      'documents.document_code',
      'documents.title as document_title',
      'signature_requests.request_type'
    ])
    .join('esign.signature_requests as signature_requests', 'signature_details.request_id', 'signature_requests.id')
    .join('esign.documents as documents', 'signature_requests.document_id', 'documents.id')
    .where('signature_details.user_id', userId)
    .where('signature_details.is_marked_for_tte', true)
    .where('signature_details.status', 'marked_for_tte');

  const result = await query
    .orderBy('signature_details.marked_at', 'desc')
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
 * Get rejected documents (Tab: Ditolak)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Rejected documents with pagination
 */
export const getRejectedDocuments = async (filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  const query = SignatureDetails.query()
    .select([
      'signature_details.*',
      'documents.document_code',
      'documents.title as document_title',
      'users.name as rejected_by_name'
    ])
    .join('esign.signature_requests as signature_requests', 'signature_details.request_id', 'signature_requests.id')
    .join('esign.documents as documents', 'signature_requests.document_id', 'documents.id')
    .leftJoin('users', 'signature_details.user_id', 'users.id')
    .where('signature_details.status', 'rejected');

  const result = await query
    .orderBy('signature_details.rejected_at', 'desc')
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
 * Get completed documents (Tab: Selesai)
 * @param {String} userId - User ID (optional, for user-specific filter)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Completed documents with pagination
 */
export const getCompletedDocuments = async (userId = null, filters = {}) => {
  const { page = 1, limit = 10 } = filters;

  let query = SignatureRequests.query()
    .select([
      'signature_requests.*',
      'documents.document_code',
      'documents.title as document_title'
    ])
    .join('esign.documents as documents', 'signature_requests.document_id', 'documents.id')
    .where('signature_requests.status', 'completed');

  // If userId provided, filter by user involvement
  if (userId) {
    query = query.where(builder => {
      builder.where('signature_requests.created_by', userId)
        .orWhereExists(
          SignatureDetails.query()
            .where('signature_details.request_id', 'signature_requests.id')
            .where('signature_details.user_id', userId)
        );
    });
  }

  const result = await query
    .orderBy('signature_requests.completed_at', 'desc')
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

// ==========================================
// WORKFLOW ACTION SERVICES
// ==========================================

/**
 * Review/approve document
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} notes - Review notes
 * @returns {Promise<Object>} - Updated signature detail
 */
export const reviewDocument = async (detailId, userId, notes = '') => {
  const detail = await validateSignatureDetailAction(detailId, userId, 'review');

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(detailId, {
    status: 'reviewed',
    signed_at: new Date(),
    notes: notes,
    updated_at: new Date(),
  });

  // Check if this completes the request
  await checkAndCompleteRequest(detail.request_id);

  return updatedDetail;
};

/**
 * Mark document for TTE (Pimpinan marking untuk ajudan)
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} notes - Marking notes
 * @returns {Promise<Object>} - Updated signature detail
 */
export const markForTte = async (detailId, userId, notes = '') => {
  const detail = await validateSignatureDetailAction(detailId, userId, 'mark');

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(detailId, {
    status: 'marked_for_tte',
    is_marked_for_tte: true,
    marked_at: new Date(),
    marked_notes: notes,
    updated_at: new Date(),
  });

  return updatedDetail;
};

/**
 * Sign document directly (TTE langsung)
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {Object} signData - Signature data
 * @returns {Promise<Object>} - Updated signature detail
 */
export const signDocument = async (detailId, userId, signData = {}) => {
  const { notes = '', signature_x, signature_y, signature_page = 1, signed_by_delegate = false } = signData;

  const detail = await validateSignatureDetailAction(detailId, userId, 'sign');

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(detailId, {
    status: 'signed',
    signed_at: new Date(),
    signed_by_delegate,
    signature_x,
    signature_y,
    signature_page,
    notes: notes,
    updated_at: new Date(),
  });

  // Check if this completes the request
  await checkAndCompleteRequest(detail.request_id);

  return updatedDetail;
};

/**
 * Reject document
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} - Updated signature detail
 */
export const rejectDocument = async (detailId, userId, reason) => {
  if (!reason || reason.trim() === '') {
    throw new Error("Alasan penolakan wajib diisi");
  }

  const detail = await validateSignatureDetailAction(detailId, userId, 'reject');

  // Update signature detail
  const updatedDetail = await SignatureDetails.query().patchAndFetchById(detailId, {
    status: 'rejected',
    rejected_at: new Date(),
    rejection_reason: reason,
    updated_at: new Date(),
  });

  // Update signature request status
  await SignatureRequests.query().patchAndFetchById(detail.request_id, {
    status: 'rejected',
    updated_at: new Date(),
  });

  // Update document status
  const signatureRequest = await SignatureRequests.query().findById(detail.request_id);
  await Documents.query().patchAndFetchById(signatureRequest.document_id, {
    status: 'rejected',
    updated_at: new Date(),
  });

  return updatedDetail;
};

// ==========================================
// UTILITY SERVICES
// ==========================================

/**
 * Get document history/timeline
 * @param {String} documentId - Document ID
 * @returns {Promise<Array>} - Document history
 */
export const getDocumentHistory = async (documentId) => {
  const history = await SignatureDetails.query()
    .select([
      'signature_details.*',
      'users.name as user_name',
      'signature_requests.request_type'
    ])
    .join('esign.signature_requests as signature_requests', 'signature_details.request_id', 'signature_requests.id')
    .leftJoin('users', 'signature_details.user_id', 'users.id')
    .where('signature_requests.document_id', documentId)
    .orderBy('signature_details.sequence_order');

  return history.map(item => ({
    ...item,
    status_label: getStatusLabel(item.status, item.signed_by_delegate),
    timestamp: item.signed_at || item.rejected_at || item.marked_at || item.created_at,
  }));
};

/**
 * Update signature position
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {Object} position - Position data
 * @returns {Promise<Object>} - Updated signature detail
 */
export const updateSignaturePosition = async (detailId, userId, position) => {
  const { signature_x, signature_y, signature_page = 1 } = position;

  const detail = await SignatureDetails.query().findById(detailId);
  if (!detail) {
    throw new Error("Detail tanda tangan tidak ditemukan");
  }

  if (detail.user_id !== userId) {
    throw new Error("Tidak memiliki akses untuk mengubah posisi tanda tangan");
  }

  if (!['waiting', 'marked_for_tte'].includes(detail.status)) {
    throw new Error("Posisi tanda tangan tidak dapat diubah");
  }

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(detailId, {
    signature_x,
    signature_y,
    signature_page,
    updated_at: new Date(),
  });

  return updatedDetail;
};

// ==========================================
// VALIDATION & HELPER SERVICES
// ==========================================

/**
 * Validate signature detail action
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} action - Action type
 * @returns {Promise<Object>} - Signature detail if valid
 */
export const validateSignatureDetailAction = async (detailId, userId, action) => {
  const detail = await SignatureDetails.query()
    .findById(detailId)
    .withGraphFetched('signature_request');

  if (!detail) {
    throw new Error("Detail tanda tangan tidak ditemukan");
  }

  if (detail.user_id !== userId) {
    throw new Error("Tidak memiliki akses untuk melakukan aksi ini");
  }

  if (detail.status !== 'waiting') {
    throw new Error("Dokumen sudah diproses sebelumnya");
  }

  // Check sequential order
  if (detail.signature_request.request_type === 'sequential') {
    const previousSteps = await SignatureDetails.query()
      .where('request_id', detail.request_id)
      .where('sequence_order', '<', detail.sequence_order)
      .whereNotIn('status', ['reviewed', 'signed']);

    if (previousSteps.length > 0) {
      throw new Error("Menunggu langkah sebelumnya diselesaikan");
    }
  }

  return detail;
};

/**
 * Check and complete signature request if all steps done
 * @param {String} requestId - Request ID
 * @returns {Promise<Boolean>} - True if completed
 */
export const checkAndCompleteRequest = async (requestId) => {
  const pendingDetails = await SignatureDetails.query()
    .where('request_id', requestId)
    .where('status', 'waiting');

  const rejectedDetails = await SignatureDetails.query()
    .where('request_id', requestId)
    .where('status', 'rejected');

  // If no pending and no rejected, complete the request
  if (pendingDetails.length === 0 && rejectedDetails.length === 0) {
    await SignatureRequests.query().patchAndFetchById(requestId, {
      status: 'completed',
      completed_at: new Date(),
      updated_at: new Date(),
    });

    // Update document status
    const signatureRequest = await SignatureRequests.query().findById(requestId);
    await Documents.query().patchAndFetchById(signatureRequest.document_id, {
      status: 'signed',
      updated_at: new Date(),
    });

    return true;
  }

  return false;
};

/**
 * Get status label for UI
 * @param {String} status - Status
 * @param {Boolean} signedByDelegate - Signed by delegate
 * @returns {String} - Status label
 */
export const getStatusLabel = (status, signedByDelegate = false) => {
  switch (status) {
    case 'waiting':
      return 'Menunggu';
    case 'reviewed':
      return 'Sudah direview';
    case 'marked_for_tte':
      return 'Siap TTE (marking)';
    case 'signed':
      return signedByDelegate ? 'Sudah TTE (oleh ajudan)' : 'Sudah TTE';
    case 'rejected':
      return 'Ditolak';
    default:
      return status;
  }
};

/**
 * Count marked documents for user
 * @param {String} userId - User ID
 * @returns {Promise<Number>} - Count of marked documents
 */
export const countMarkedDocuments = async (userId) => {
  const result = await SignatureDetails.query()
    .where('user_id', userId)
    .where('is_marked_for_tte', true)
    .where('status', 'marked_for_tte')
    .count('* as count')
    .first();

  return parseInt(result.count) || 0;
};