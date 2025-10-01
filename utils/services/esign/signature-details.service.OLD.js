/**
 * Esign Signature Details Service
 * Business logic for signature detail management (Core TTE Workflow)
 */

const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
const Documents = require("@/models/esign/esign-documents.model");
const path = require("path");
const fs = require("fs");

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
export const reviewDocument = async (detailId, userId, notes = "") => {
  const detail = await validateSignatureDetailAction(
    detailId,
    userId,
    "review"
  );

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(
    detailId,
    {
      status: "reviewed",
      signed_at: new Date(),
      notes: notes,
      updated_at: new Date(),
    }
  );

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
export const markForTte = async (detailId, userId, notes = "") => {
  const detail = await validateSignatureDetailAction(detailId, userId, "mark");

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(
    detailId,
    {
      status: "marked_for_tte",
      is_marked_for_tte: true,
      marked_at: new Date(),
      marked_notes: notes,
      updated_at: new Date(),
    }
  );

  return updatedDetail;
};

// ==========================================
// HELPER FUNCTIONS FOR SIGNING
// ==========================================

/**
 * Retrieve PDF file from Minio as base64
 * @param {Object} mc - Minio client
 * @param {String} filePath - File path in Minio
 * @returns {Promise<String>} - Base64 file content
 */
const retrievePdfFromMinio = async (mc, filePath) => {
  console.log("   [retrievePdfFromMinio] START");
  console.log("   [retrievePdfFromMinio] mc:", mc ? "EXISTS" : "UNDEFINED");
  console.log("   [retrievePdfFromMinio] mc type:", typeof mc);
  console.log("   [retrievePdfFromMinio] filePath:", filePath);

  const { downloadEsignDocument } = require("@/utils/helper/minio-helper");

  try {
    console.log("   [retrievePdfFromMinio] Calling downloadEsignDocument...");

    // Set timeout untuk debugging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Download timeout after 30s")), 30000);
    });

    const downloadPromise = downloadEsignDocument(mc, filePath);

    const result = await Promise.race([downloadPromise, timeoutPromise]);

    console.log(
      "   [retrievePdfFromMinio] Success, file size:",
      result?.length
    );
    return result;
  } catch (error) {
    console.error("   [retrievePdfFromMinio] Error:", error.message);
    console.error("   [retrievePdfFromMinio] Error stack:", error.stack);
    throw error;
  }
};

/**
 * Upload signed PDF back to Minio (overwrite)
 * @param {Object} mc - Minio client
 * @param {String} signedFileBase64 - Signed file in base64
 * @param {String} filePath - Original file path
 * @param {String} documentCode - Document code
 * @param {String} userId - User ID
 * @returns {Promise<void>}
 */
const uploadSignedPdfToMinio = async (
  mc,
  signedFileBase64,
  filePath,
  documentCode,
  userId
) => {
  const { uploadEsignDocument } = require("@/utils/helper/minio-helper");
  const signedFileBuffer = Buffer.from(signedFileBase64, "base64");
  const filename = filePath.split("/").pop();

  await uploadEsignDocument(
    mc,
    signedFileBuffer,
    filename,
    documentCode,
    signedFileBuffer.length,
    "application/pdf",
    userId
  );
};

/**
 * Call BSrE API to sign document
 * @param {Object} params - Signing parameters
 * @returns {Promise<Object>} - Signed file result
 */
const callBsreSignApi = async (params) => {
  const { signWithCoordinate } = require("@/utils/esign-utils");
  const { nik, passphrase, base64File, signatureProperties } = params;

  const result = await signWithCoordinate({
    nik,
    passphrase,
    file: [base64File],
    signatureProperties,
  });

  if (!result.success) {
    throw new Error(result.message || "Gagal menandatangani dokumen");
  }

  console.log("result", result);

  const signedFileBase64 = result.data?.file?.[0];
  if (!signedFileBase64) {
    throw new Error("File hasil tanda tangan tidak ditemukan");
  }

  return { signedFileBase64, result };
};

/**
 * Sign document directly (TTE langsung)
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {Object} signData - Signature data
 * @param {Object} mc - Minio client instance
 * @returns {Promise<Object>} - Updated signature detail
 */
export const signDocument = async (detailId, userId, signData = {}, mc) => {
  console.log("=== SIGN DOCUMENT START ===");
  console.log("detailId:", detailId);
  console.log("userId:", userId);
  console.log("signData:", { ...signData, passphrase: "***HIDDEN***" });
  console.log("mc (Minio Client):", mc ? "EXISTS" : "UNDEFINED");
  console.log("mc type:", typeof mc);

  const {
    notes = "",
    signature_x,
    signature_y,
    signature_page = 1,
    signed_by_delegate = false,
    passphrase,
    nik,
  } = signData;

  // Import required dependencies
  const {
    logBsreInteraction,
  } = require("@/utils/services/esign/bsre.services");
  const BsreTransactions = require("@/models/esign/esign-bsre-transactions.model");
  const { nanoid } = require("nanoid");

  console.log("1. Starting validation...");
  // Validate user can perform action
  const detail = await validateSignatureDetailAction(detailId, userId, "sign");
  console.log("✓ Validation passed");

  console.log("2. Fetching user data and request data...");
  // Get signature detail and request data with document
  const userData = await SignatureDetails.query().findById(detailId);
  const requestData = await SignatureRequests.query()
    .findById(userData.request_id)
    .withGraphFetched("document");

  console.log("userData:", {
    id: userData.id,
    user_id: userData.user_id,
    sign_pages: userData.sign_pages,
    tag_coordinate: userData.tag_coordinate,
  });
  console.log(
    "requestData.document:",
    requestData.document
      ? {
          id: requestData.document.id,
          file_path: requestData.document.file_path,
        }
      : "NULL"
  );

  if (!requestData.document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  console.log("3. Starting transaction...");
  // Start transaction
  const trx = await SignatureDetails.startTransaction();
  console.log("✓ Transaction started");

  try {
    console.log("4. Retrieving PDF from Minio...");
    console.log("   file_path:", requestData.document.file_path);
    // 1. Retrieve PDF file from Minio as base64
    const base64File = await retrievePdfFromMinio(
      mc,
      requestData.document.file_path
    );
    console.log("✓ PDF retrieved, size:", base64File ? base64File.length : 0);

    console.log("5. Loading logo image for signature...");
    // Load logo image for signature first (before signatureProperties)
    const logoPath = path.join(
      process.cwd(),
      "utils",
      "services",
      "esign",
      "logo.png"
    );
    console.log("   logo path:", logoPath);
    const imageBase64 = fs.readFileSync(logoPath, "base64");
    console.log("✓ Logo loaded, size:", imageBase64.length);

    console.log("6. Preparing signature properties...");
    // 2. Prepare signature properties (after imageBase64 is loaded)
    const signatureProperties = userData?.sign_pages?.map((page) => ({
      tampilan: "VISIBLE",
      page,
      width: 10,
      height: 10,
      imageBase64,
      tag_koordinat: userData.tag_coordinate || "$",
    }));
    console.log("   signatureProperties:", signatureProperties);

    console.log("6. Calling BSrE API to sign document...");
    console.log("   NIK:", nik ? "***PROVIDED***" : "MISSING");
    console.log("   Passphrase:", passphrase ? "***PROVIDED***" : "MISSING");
    // 3. Call BSrE API to sign document
    const startTime = Date.now();
    let signResult = null;
    let bsreError = null;

    try {
      const { signedFileBase64, result } = await callBsreSignApi({
        nik,
        passphrase,
        imageBase64,
        base64File,
        signatureProperties,
      });

      signResult = { signedFileBase64, result };
      console.log("✓ BSrE signing successful");
    } catch (error) {
      bsreError = error;
      console.error("✗ BSrE signing failed:", error.message);
    }

    const responseTime = Date.now() - startTime;
    console.log("   Response time:", responseTime, "ms");

    console.log("7. Creating BSrE transaction record...");
    // 4. Create BSrE transaction record with status
    const transactionId = nanoid();
    const now = new Date();

    // If signing failed, commit failed transaction and throw error immediately
    if (bsreError) {
      console.log(
        "✗ BSrE signing failed, creating failed transaction record..."
      );

      await BsreTransactions.query(trx).insert({
        id: transactionId,
        signature_detail_id: detailId,
        document_id: requestData.document_id,
        original_file: requestData.document.file_path,
        signed_file: null,
        status: "failed",
        error_message: bsreError.message,
        request_data: {
          nik: nik,
          signatureProperties,
          file_size: base64File.length,
        },
        response_data: {},
        created_at: now,
        updated_at: now,
        completed_at: null,
      });

      // Commit the failed transaction record
      await trx.commit();
      console.log("✓ Failed transaction record committed");
      console.log("   Transaction ID for logging:", transactionId);

      // Verify transaction exists before logging
      const verifyTrx = await BsreTransactions.query().findById(transactionId);
      console.log("   Transaction exists in DB:", verifyTrx ? "YES" : "NO");

      // Log BSrE interaction (outside transaction, after commit)
      console.log("8. Logging BSrE interaction...");
      try {
        await logBsreInteraction({
          transaction_id: transactionId,
          action: "sign_document",
          endpoint: "/sign/coordinate",
          http_method: "POST",
          http_status: 500,
          request_payload: {
            nik: nik,
            signatureProperties,
            file_size: base64File.length,
          },
          response_payload: {},
          error_detail: bsreError.message,
          response_time_ms: responseTime,
        });
        console.log("✓ Interaction logged");
      } catch (logError) {
        console.error("✗ Logging error (non-critical):", logError.message);
        // Don't throw - logging failure shouldn't stop the process
      }

      // Throw error to stop execution
      console.log("✗ Throwing BSrE error");
      throw bsreError;
    }

    // Success case: create success transaction record
    await BsreTransactions.query(trx).insert({
      id: transactionId,
      signature_detail_id: detailId,
      document_id: requestData.document_id,
      original_file: requestData.document.file_path,
      signed_file: requestData.document.file_path, // Same file (overwrite)
      status: "completed",
      error_message: null,
      request_data: {
        nik: nik,
        signatureProperties,
        file_size: base64File.length,
      },
      response_data: signResult?.result || {},
      created_at: now,
      updated_at: now,
      completed_at: now,
    });
    console.log("✓ Transaction record created, ID:", transactionId);

    console.log("8. Uploading signed file back to Minio...");
    // 5. Upload signed file back to Minio (overwrite)
    await uploadSignedPdfToMinio(
      mc,
      signResult.signedFileBase64,
      requestData.document.file_path,
      requestData.document.document_code,
      userId
    );
    console.log("✓ Signed file uploaded");

    console.log("9. Updating signature detail...");
    // 6. Update signature detail
    const updatedDetail = await SignatureDetails.query(trx).patchAndFetchById(
      detailId,
      {
        status: "signed",
        signed_at: new Date(),
        signed_by_delegate,
        signature_x,
        signature_y,
        signature_page,
        notes: notes,
        // bsre_transaction_id: transactionId,
        updated_at: new Date(),
      }
    );
    console.log("✓ Signature detail updated");

    console.log("10. Checking if request is complete...");
    // 7. Check if this completes the request
    await checkAndCompleteRequest(detail.request_id);
    console.log("✓ Completion check done");

    console.log("11. Committing transaction...");
    // Commit transaction
    await trx.commit();
    console.log("✓ Transaction committed");

    // Log BSrE interaction after successful commit (outside transaction)
    console.log("12. Logging BSrE interaction...");
    try {
      await logBsreInteraction({
        transaction_id: transactionId,
        action: "sign_document",
        endpoint: "/sign/coordinate",
        http_method: "POST",
        http_status: 200,
        request_payload: {
          nik: nik,
          signatureProperties,
          file_size: base64File.length,
        },
        response_payload: signResult?.result || {},
        error_detail: null,
        response_time_ms: responseTime,
      });
      console.log("✓ Interaction logged");
    } catch (logError) {
      console.error("✗ Logging error (non-critical):", logError.message);
      // Don't throw - logging failure shouldn't stop successful signing
    }

    console.log("=== SIGN DOCUMENT SUCCESS ===");
    return updatedDetail;
  } catch (error) {
    console.error("=== SIGN DOCUMENT ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    // Check if transaction is still active before rollback
    if (!trx.isCompleted()) {
      console.log("Rolling back transaction...");
      try {
        await trx.rollback();
        console.log("✓ Transaction rolled back");
      } catch (rollbackError) {
        console.error("✗ Rollback error:", rollbackError.message);
      }
    } else {
      console.log("Transaction already completed (committed/rolled back)");
    }

    throw error;
  }
};

/**
 * Reject document
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} reason - Rejection reason
 * @returns {Promise<Object>} - Updated signature detail
 */
export const rejectDocument = async (detailId, userId, reason) => {
  if (!reason || reason.trim() === "") {
    throw new Error("Alasan penolakan wajib diisi");
  }

  const detail = await validateSignatureDetailAction(
    detailId,
    userId,
    "reject"
  );

  // Update signature detail
  const updatedDetail = await SignatureDetails.query().patchAndFetchById(
    detailId,
    {
      status: "rejected",
      rejected_at: new Date(),
      rejection_reason: reason,
      updated_at: new Date(),
    }
  );

  // Update signature request status
  await SignatureRequests.query().patchAndFetchById(detail.request_id, {
    status: "rejected",
    updated_at: new Date(),
  });

  // Update document status
  const signatureRequest = await SignatureRequests.query().findById(
    detail.request_id
  );
  await Documents.query().patchAndFetchById(signatureRequest.document_id, {
    status: "rejected",
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
      "signature_details.*",
      "users.username as user_name",
      "signature_requests.request_type",
    ])
    .join(
      "esign.signature_requests as signature_requests",
      "signature_details.request_id",
      "signature_requests.id"
    )
    .leftJoin("users", "signature_details.user_id", "users.id")
    .where("signature_requests.document_id", documentId)
    .orderBy("signature_details.sequence_order");

  return history.map((item) => ({
    ...item,
    status_label: getStatusLabel(item.status, item.signed_by_delegate),
    timestamp:
      item.signed_at || item.rejected_at || item.marked_at || item.created_at,
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

  if (!["waiting", "marked_for_tte"].includes(detail.status)) {
    throw new Error("Posisi tanda tangan tidak dapat diubah");
  }

  const updatedDetail = await SignatureDetails.query().patchAndFetchById(
    detailId,
    {
      signature_x,
      signature_y,
      signature_page,
      updated_at: new Date(),
    }
  );

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
export const validateSignatureDetailAction = async (
  detailId,
  userId,
  action
) => {
  const detail = await SignatureDetails.query()
    .findById(detailId)
    .withGraphFetched("signature_request");

  if (!detail) {
    throw new Error("Detail tanda tangan tidak ditemukan");
  }

  if (detail.user_id !== userId) {
    throw new Error("Tidak memiliki akses untuk melakukan aksi ini");
  }

  if (detail.status !== "waiting") {
    throw new Error("Dokumen sudah diproses sebelumnya");
  }

  // Check sequential order
  if (detail.signature_request.request_type === "sequential") {
    const previousSteps = await SignatureDetails.query()
      .where("request_id", detail.request_id)
      .where("sequence_order", "<", detail.sequence_order)
      .whereNotIn("status", ["reviewed", "signed"]);

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
  console.log("   [checkAndCompleteRequest] Checking request:", requestId);

  const pendingDetails = await SignatureDetails.query()
    .where("request_id", requestId)
    .where("status", "waiting");

  const rejectedDetails = await SignatureDetails.query()
    .where("request_id", requestId)
    .where("status", "rejected");

  console.log("   [checkAndCompleteRequest] Pending details:", pendingDetails.length);
  console.log("   [checkAndCompleteRequest] Rejected details:", rejectedDetails.length);

  // If no pending and no rejected, complete the request
  if (pendingDetails.length === 0 && rejectedDetails.length === 0) {
    console.log("   [checkAndCompleteRequest] All steps completed! Marking request as completed...");

    await SignatureRequests.query().patchAndFetchById(requestId, {
      status: "completed",
      completed_at: new Date(),
      updated_at: new Date(),
    });

    // Update document status
    const signatureRequest = await SignatureRequests.query().findById(
      requestId
    );
    console.log("   [checkAndCompleteRequest] Updating document status to 'signed'...");
    await Documents.query().patchAndFetchById(signatureRequest.document_id, {
      status: "signed",
      updated_at: new Date(),
    });

    console.log("   [checkAndCompleteRequest] ✓ Request and document completed!");
    return true;
  }

  console.log("   [checkAndCompleteRequest] Still waiting for other signatures");
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
    case "waiting":
      return "Menunggu";
    case "reviewed":
      return "Sudah direview";
    case "marked_for_tte":
      return "Siap TTE (marking)";
    case "signed":
      return signedByDelegate ? "Sudah TTE (oleh ajudan)" : "Sudah TTE";
    case "rejected":
      return "Ditolak";
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
    .where("user_id", userId)
    .where("is_marked_for_tte", true)
    .where("status", "marked_for_tte")
    .count("* as count")
    .first();

  return parseInt(result.count) || 0;
};
