/**
 * Esign Signature Requests Service
 * Business logic for signature request management
 */

const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const Documents = require("@/models/esign/esign-documents.model");

// ==========================================
// SIGNATURE REQUEST CRUD SERVICES
// ==========================================

/**
 * Validate document for signature request
 * @param {String} documentId - Document ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Document if valid
 */
const validateDocumentForSignature = async (documentId, userId) => {
  const document = await Documents.query().findById(documentId);

  if (!document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  if (document.created_by !== userId) {
    throw new Error(
      "Tidak memiliki akses untuk membuat pengajuan TTE pada dokumen ini"
    );
  }

  if (document.status !== "draft") {
    throw new Error(
      "Hanya dokumen dengan status draft yang dapat diajukan untuk TTE"
    );
  }

  return document;
};

/**
 * Create signature details for self sign
 * @param {String} requestId - Request ID
 * @param {String} userId - User ID
 * @param {Array} signPages - Pages to sign
 * @param {String} tag_coordinate - Tag coordinate
 * @param {String} notes - Notes
 * @param {Object} trx - Transaction object
 * @param {Array} coordinates - Detected coordinates from PDF
 * @returns {Promise<Object>} - Created signature detail
 */
const createSelfSignDetail = async (
  requestId,
  userId,
  signPages,
  tag_coordinate,
  notes,
  trx,
  coordinates = null
) => {
  if (!signPages || signPages.length === 0) {
    throw new Error("Halaman tanda tangan harus ditentukan untuk self sign");
  }

  console.log(
    "[createSelfSignDetail] Coordinates:",
    coordinates ? "FOUND" : "NOT FOUND"
  );

  return await SignatureDetails.query(trx).insert({
    request_id: requestId,
    user_id: userId,
    role_type: "signer",
    sequence_order: 1,
    status: "waiting",
    sign_pages: signPages,
    signature_x: null,
    signature_y: null,
    tag_coordinate,
    sign_coordinate: coordinates ? JSON.stringify(coordinates) : null, // Convert to JSON string
    notes,
  });
};

/**
 * Create signature details for request sign
 * @param {String} requestId - Request ID
 * @param {Array} signers - Array of signers (with coordinates)
 * @param {Object} trx - Transaction object
 * @returns {Promise<Array>} - Created signature details
 */
const createRequestSignDetails = async (requestId, signers, trx) => {
  if (!signers || signers.length === 0) {
    throw new Error("Minimal harus ada 1 penandatangan untuk request sign");
  }

  const signatureDetails = [];

  for (let i = 0; i < signers.length; i++) {
    const signer = signers[i];

    console.log(
      `[createRequestSignDetails] Signer ${i + 1} coordinates:`,
      signer.coordinates ? "FOUND" : "NOT FOUND"
    );

    const detail = await SignatureDetails.query(trx).insert({
      request_id: requestId,
      user_id: signer.user_id,
      role_type: signer.role_type || "signer",
      sequence_order: signer.sequence_order || i + 1,
      status: "waiting",
      sign_pages: JSON.stringify(signer.signature_pages) || [1],
      tag_coordinate: signer.tag_coordinate || "!",
      signature_x: signer.signature_x,
      signature_y: signer.signature_y,
      sign_coordinate: signer.coordinates
        ? JSON.stringify(signer.coordinates)
        : null, // Convert to JSON string
      notes: signer.notes,
    });
    signatureDetails.push(detail);
  }

  return signatureDetails;
};

/**
 * Create new signature request
 * @param {String} documentId - Document ID
 * @param {Object} data - Signature request data (includes sign_coordinate from frontend)
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Created signature request
 */
export const createSignatureRequest = async (documentId, data, userId) => {
  const {
    request_type = "parallel",
    notes,
    signers = [],
    type = "self_sign",
    sign_pages = [],
    tag_coordinate,
    sign_coordinate = [], // Koordinat TTE dari frontend
  } = data;

  // Validate document first (outside transaction)
  const document = await validateDocumentForSignature(documentId, userId);

  console.log(
    "[createSignatureRequest] Received sign_coordinate:",
    sign_coordinate?.length || 0,
    "positions"
  );

  // Use database transaction for data consistency
  return await SignatureRequests.transaction(async (trx) => {
    try {
      // 1. Create signature request
      const signatureRequest = await SignatureRequests.query(trx).insert({
        document_id: documentId,
        request_type,
        type,
        status: "pending",
        notes,
        created_by: userId,
      });

      // 2. Create signature details based on type
      let signatureDetails = [];

      if (type === "self_sign") {
        // For self sign, use sign_coordinate directly from frontend
        // Extract sign_pages from sign_coordinate array
        const extractedSignPages =
          sign_coordinate.length > 0
            ? [...new Set(sign_coordinate.map((coord) => coord.page))]
            : sign_pages || [];

        const detail = await createSelfSignDetail(
          signatureRequest.id,
          userId,
          JSON.stringify(extractedSignPages),
          tag_coordinate,
          notes,
          trx,
          sign_coordinate // Pass coordinates from frontend
        );
        signatureDetails = [detail];
      } else if (type === "request_sign") {
        // For request sign, coordinates are already in signers data from frontend
        // Each signer has their coordinates embedded in sign_coordinate array
        const signersWithCoordinates = signers.map((signer) => {
          // Filter coordinates for this signer
          const signerCoordinates = sign_coordinate.filter(
            (coord) => coord.signerId === signer.user_id
          );

          // Extract sign_pages for this signer from their coordinates
          const signerPages =
            signerCoordinates.length > 0
              ? [...new Set(signerCoordinates.map((coord) => coord.page))]
              : [];

          return {
            ...signer,
            coordinates: signerCoordinates, // Coordinates from frontend
            signature_pages: signerPages, // Pages where this signer needs to sign
          };
        });

        signatureDetails = await createRequestSignDetails(
          signatureRequest.id,
          signersWithCoordinates,
          trx
        );
      } else {
        throw new Error(
          "Tipe signature request tidak valid. Harus 'self_sign' atau 'request_sign'"
        );
      }

      // 3. Update document status
      await Documents.query(trx).patchAndFetchById(documentId, {
        status: "in_progress",
        updated_at: new Date(),
      });

      // 4. Return complete result
      return {
        ...signatureRequest,
        signature_details: signatureDetails,
      };
    } catch (error) {
      // Transaction will automatically rollback on error
      throw error;
    }
  });
};

/**
 * Get signature requests with pagination and filters
 * @param {String} userId - User ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Signature requests with pagination
 */
export const getSignatureRequests = async (userId, filters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    request_type,
    document_id,
    // Dashboard filters
    user_action_required,
    marked_for_tte,
    type, // self_sign or request_sign
  } = filters;

  let query = SignatureRequests.query().withGraphFetched(
    "[signature_details.[user(simpleWithImage)], creator(simpleWithImage), document]"
  );

  // Filter by user access (created by user OR user is a signer)
  query = query.where((builder) => {
    builder
      .where("signature_requests.created_by", userId)
      .orWhereExists(
        SignatureDetails.query()
          .whereRaw(
            "signature_details.request_id = signature_requests.id::text"
          )
          .where("signature_details.user_id", userId)
      );
  });

  // Standard filters
  if (status) {
    query = query.where("signature_requests.status", status);
  }

  if (request_type) {
    query = query.where("signature_requests.request_type", request_type);
  }

  if (document_id) {
    query = query.where("signature_requests.document_id", document_id);
  }

  if (type) {
    query = query.where("signature_requests.type", type);
  }

  // Dashboard filters
  // Filter: user_action_required (pending documents waiting for user action)
  if (user_action_required === "true" || user_action_required === true) {
    query = query.where("signature_requests.status", "pending").whereExists(
      SignatureDetails.query()
        .where("signature_details.request_id", "signature_requests.id")
        .where("signature_details.user_id", userId)
        .where("signature_details.status", "waiting")
        .where((detailBuilder) => {
          // For parallel requests, all waiting tasks can be actioned
          detailBuilder.where("signature_requests.request_type", "parallel");

          // For sequential requests, only current step can be actioned
          detailBuilder.orWhere((seqBuilder) => {
            seqBuilder
              .where("signature_requests.request_type", "sequential")
              .whereNotExists(
                SignatureDetails.query()
                  .whereColumn(
                    "signature_details.request_id",
                    "signature_requests.id"
                  )
                  .whereColumn(
                    "signature_details.sequence_order",
                    "<",
                    "signature_details.sequence_order"
                  )
                  .whereNotIn("signature_details.status", [
                    "reviewed",
                    "signed",
                  ])
              );
          });
        })
    );
  }

  // Filter: marked_for_tte (documents marked by user for delegate signing)
  if (marked_for_tte === "true" || marked_for_tte === true) {
    query = query.whereExists(
      SignatureDetails.query()
        .where("signature_details.request_id", "signature_requests.id")
        .where("signature_details.user_id", userId)
        .where("signature_details.is_marked_for_tte", true)
        .where("signature_details.status", "marked_for_tte")
    );
  }

  const result = await query
    .orderBy("signature_requests.created_at", "desc")
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
 * Get signature request by ID
 * @param {String} requestId - Request ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Signature request with details
 */
export const getSignatureRequestById = async (requestId, userId) => {
  const signatureRequest = await SignatureRequests.query()
    .findById(requestId)
    .withGraphFetched(
      "[signature_details.[user(simpleWithImage)], creator(simpleWithImage), document]"
    );

  if (!signatureRequest) {
    throw new Error("Pengajuan TTE tidak ditemukan");
  }

  // Check access permission
  const hasAccess =
    signatureRequest.created_by === userId ||
    signatureRequest.signature_details.some(
      (detail) => detail.user_id === userId
    ) ||
    signatureRequest.document.is_public;

  if (!hasAccess) {
    throw new Error("Tidak memiliki akses ke pengajuan TTE ini");
  }

  return signatureRequest;
};

/**
 * Update signature request
 * @param {String} requestId - Request ID
 * @param {Object} data - Update data
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Updated signature request
 */
export const updateSignatureRequest = async (requestId, data, userId) => {
  const { notes } = data;

  const signatureRequest = await SignatureRequests.query().findById(requestId);

  if (!signatureRequest) {
    throw new Error("Pengajuan TTE tidak ditemukan");
  }

  if (signatureRequest.created_by !== userId) {
    throw new Error("Tidak memiliki akses untuk mengubah pengajuan TTE ini");
  }

  if (signatureRequest.status !== "pending") {
    throw new Error("Hanya pengajuan dengan status pending yang dapat diubah");
  }

  const updatedRequest = await SignatureRequests.query().patchAndFetchById(
    requestId,
    {
      notes: notes || signatureRequest.notes,
      updated_at: new Date(),
    }
  );

  return updatedRequest;
};

/**
 * Cancel signature request
 * @param {String} requestId - Request ID
 * @param {String} userId - User ID
 * @returns {Promise<Boolean>} - Success status
 */
export const cancelSignatureRequest = async (requestId, userId) => {
  const signatureRequest = await SignatureRequests.query()
    .findById(requestId)
    .withGraphFetched("document");

  if (!signatureRequest) {
    throw new Error("Pengajuan TTE tidak ditemukan");
  }

  if (signatureRequest.created_by !== userId) {
    throw new Error("Tidak memiliki akses untuk membatalkan pengajuan TTE ini");
  }

  if (["completed", "cancelled"].includes(signatureRequest.status)) {
    throw new Error("Pengajuan TTE tidak dapat dibatalkan");
  }

  // Update signature request status
  await SignatureRequests.query().patchAndFetchById(requestId, {
    status: "cancelled",
    updated_at: new Date(),
  });

  // Update all pending signature details
  await SignatureDetails.query()
    .where("request_id", requestId)
    .where("status", "waiting")
    .patch({
      status: "cancelled",
      updated_at: new Date(),
    });

  // Revert document status to draft
  await Documents.query().patchAndFetchById(signatureRequest.document_id, {
    status: "draft",
    updated_at: new Date(),
  });

  return true;
};

// ==========================================
// WORKFLOW MANAGEMENT SERVICES
// ==========================================

/**
 * Get workflow status for signature request
 * @param {String} requestId - Request ID
 * @returns {Promise<Object>} - Workflow status
 */
export const getWorkflowStatus = async (requestId) => {
  const signatureRequest = await SignatureRequests.query()
    .findById(requestId)
    .withGraphFetched("signature_details");

  if (!signatureRequest) {
    throw new Error("Pengajuan TTE tidak ditemukan");
  }

  const details = signatureRequest.signature_details;
  const totalSigners = details.length;
  const completedSigners = details.filter((d) =>
    ["reviewed", "signed"].includes(d.status)
  ).length;
  const rejectedSigners = details.filter((d) => d.status === "rejected").length;
  const pendingSigners = details.filter((d) => d.status === "waiting").length;

  let currentStep = null;
  let nextSigners = [];

  if (signatureRequest.request_type === "sequential") {
    // Find current step in sequential flow
    const sortedDetails = details.sort(
      (a, b) => a.sequence_order - b.sequence_order
    );
    currentStep = sortedDetails.find((d) => d.status === "waiting");
    if (currentStep) {
      nextSigners = [currentStep];
    }
  } else {
    // Parallel flow - all waiting signers can sign
    nextSigners = details.filter((d) => d.status === "waiting");
  }

  const progress =
    totalSigners > 0 ? (completedSigners / totalSigners) * 100 : 0;

  return {
    request_id: requestId,
    request_type: signatureRequest.request_type,
    status: signatureRequest.status,
    total_signers: totalSigners,
    completed_signers: completedSigners,
    rejected_signers: rejectedSigners,
    pending_signers: pendingSigners,
    progress_percentage: Math.round(progress),
    current_step: currentStep,
    next_signers: nextSigners,
    can_complete: pendingSigners === 0 && rejectedSigners === 0,
    is_blocked: rejectedSigners > 0,
  };
};

/**
 * Check if signature request can be completed
 * @param {String} requestId - Request ID
 * @returns {Promise<Boolean>} - Can complete status
 */
export const canCompleteSignatureRequest = async (requestId) => {
  const workflow = await getWorkflowStatus(requestId);
  return workflow.can_complete && !workflow.is_blocked;
};

/**
 * Complete signature request
 * @param {String} requestId - Request ID
 * @returns {Promise<Object>} - Completed signature request
 */
export const completeSignatureRequest = async (requestId) => {
  const canComplete = await canCompleteSignatureRequest(requestId);
  if (!canComplete) {
    throw new Error("Pengajuan TTE belum dapat diselesaikan");
  }

  const signatureRequest = await SignatureRequests.query()
    .findById(requestId)
    .withGraphFetched("document");

  // Update signature request status
  const updatedRequest = await SignatureRequests.query().patchAndFetchById(
    requestId,
    {
      status: "completed",
      completed_at: new Date(),
      updated_at: new Date(),
    }
  );

  // Update document status
  await Documents.query().patchAndFetchById(signatureRequest.document_id, {
    status: "signed",
    updated_at: new Date(),
  });

  return updatedRequest;
};

// ==========================================
// VALIDATION SERVICES
// ==========================================

/**
 * Validate signature request access
 * @param {String} requestId - Request ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Signature request if accessible
 */
export const validateSignatureRequestAccess = async (requestId, userId) => {
  const signatureRequest = await SignatureRequests.query()
    .findById(requestId)
    .withGraphFetched("[signature_details, document]");

  if (!signatureRequest) {
    throw new Error("Pengajuan TTE tidak ditemukan");
  }

  const hasAccess =
    signatureRequest.created_by === userId ||
    signatureRequest.signature_details.some(
      (detail) => detail.user_id === userId
    ) ||
    signatureRequest.document.is_public;

  if (!hasAccess) {
    throw new Error("Tidak memiliki akses ke pengajuan TTE ini");
  }

  return signatureRequest;
};

/**
 * Validate user can modify signature request
 * @param {String} requestId - Request ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Signature request if modifiable
 */
export const validateSignatureRequestModifiable = async (requestId, userId) => {
  const signatureRequest = await validateSignatureRequestAccess(
    requestId,
    userId
  );

  if (signatureRequest.created_by !== userId) {
    throw new Error("Tidak memiliki akses untuk mengubah pengajuan TTE ini");
  }

  if (signatureRequest.status !== "pending") {
    throw new Error("Hanya pengajuan dengan status pending yang dapat diubah");
  }

  return signatureRequest;
};

// ==========================================
// UTILITY SERVICES
// ==========================================

/**
 * Get signature request statistics for user
 * @param {String} userId - User ID
 * @returns {Promise<Object>} - Statistics
 */
export const getSignatureRequestStats = async (userId) => {
  // Requests created by user
  const createdStats = await SignatureRequests.query()
    .where("created_by", userId)
    .select("status")
    .groupBy("status")
    .count("* as count");

  // Requests where user is a signer
  const signerStats = await SignatureRequests.query()
    .select("signature_requests.status")
    .innerJoin(
      "esign.signature_details",
      "signature_requests.id",
      "signature_details.request_id"
    )
    .where("signature_details.user_id", userId)
    .groupBy("signature_requests.status")
    .count("* as count");

  const result = {
    created: {
      total: 0,
      pending: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    },
    assigned: {
      total: 0,
      pending: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    },
  };

  createdStats.forEach((stat) => {
    const status = stat.status;
    const count = parseInt(stat.count);
    result.created[status] = count;
    result.created.total += count;
  });

  signerStats.forEach((stat) => {
    const status = stat.status;
    const count = parseInt(stat.count);
    result.assigned[status] = count;
    result.assigned.total += count;
  });

  return result;
};

/**
 * Get pending signature requests that require user action
 * Only returns requests where:
 * - User is part of workflow (in signature_details)
 * - User status is 'waiting'
 * - It's user's turn (all previous orders completed)
 * - Request status is 'pending'
 *
 * @param {String} userId - User ID
 * @param {Object} params - Query parameters (page, limit, search)
 * @returns {Promise<Object>} - Paginated pending requests
 */
export const getPendingSignatureRequests = async (userId, params = {}) => {
  const { page = 1, limit = 10, search = "" } = params;

  // Subquery to check if it's user's turn
  const isUserTurnSubquery = SignatureDetails.query()
    .select(SignatureDetails.raw("1"))
    .whereColumn("signature_details.request_id", "signature_requests.id")
    .where("signature_details.user_id", userId)
    .where("signature_details.status", "waiting")
    .where((builder) => {
      // Check if all previous orders are completed
      builder.whereNotExists(
        SignatureDetails.query()
          .whereColumn("sd_prev.request_id", "signature_details.request_id")
          .from("esign.signature_details as sd_prev")
          .whereRaw("sd_prev.sequence_order < signature_details.sequence_order")
          .whereNotIn("sd_prev.status", ["signed", "reviewed"])
      );
    });

  let query = SignatureRequests.query()
    .withGraphFetched(
      "[signature_details.[user(simpleWithImage)], creator(simpleWithImage), document]"
    )
    .where("signature_requests.status", "pending")
    .whereExists(isUserTurnSubquery);

  // Search filter
  if (search) {
    query = query.where((builder) => {
      builder
        .where("signature_requests.notes", "ilike", `%${search}%`)
        .orWhereExists(
          Documents.query()
            .whereColumn("documents.id", "signature_requests.document_id")
            .where((docBuilder) => {
              docBuilder
                .where("title", "ilike", `%${search}%`)
                .orWhere("document_code", "ilike", `%${search}%`);
            })
        );
    });
  }

  const result = await query
    .orderBy("signature_requests.created_at", "desc")
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
