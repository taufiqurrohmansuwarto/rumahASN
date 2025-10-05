/**
 * Signature Actions Service (REFACTORED)
 * Main workflow actions: Sign, Review, Mark, Reject
 */

const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
const Documents = require("@/models/esign/esign-documents.model");
const BsreTransactions = require("@/models/esign/esign-bsre-transactions.model");
const { nanoid } = require("nanoid");
const crypto = require("crypto");

// Import helper functions
const {
  retrievePdfFromMinio,
  uploadSignedPdfToMinio,
  loadSignatureLogo,
  prepareSignatureProperties,
  callBsreSignApi,
} = require("./signing-helpers.service");

const {
  validateSignatureDetailAction,
  checkAndCompleteRequest,
} = require("./workflow-helpers.service");

const { logBsreInteraction } = require("./bsre.services");
const { logSignatureAction } = require("./user-activity.service");
const { cleanupOnError } = require("./cleanup-helpers.service");

/**
 * Sign document directly (TTE langsung)
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {Object} signData - Signature data
 * @param {Object} mc - Minio client instance
 * @param {Object} req - Express request object (for IP & user agent)
 * @returns {Promise<Object>} - Updated signature detail
 */
export const signDocument = async (
  detailId,
  userId,
  signData = {},
  mc,
  req = null
) => {
  console.log("=== SIGN DOCUMENT START ===");
  console.log("detailId:", detailId);
  console.log("userId:", userId);
  console.log("signData:", { ...signData, passphrase: "***HIDDEN***" });
  console.log("mc (Minio Client):", mc ? "EXISTS" : "UNDEFINED");

  const {
    notes = "",
    signature_x,
    signature_y,
    signature_page = 1,
    signed_by_delegate = false,
    passphrase,
    nik,
  } = signData;

  // Validate user can perform action
  console.log("1. Starting validation...");
  const detail = await validateSignatureDetailAction(detailId, userId, "sign");
  console.log("✓ Validation passed");

  // Get signature detail and request data with document
  console.log("2. Fetching user data and request data...");
  const userData = await SignatureDetails.query().findById(detailId);
  const requestData = await SignatureRequests.query()
    .findById(userData.request_id)
    .withGraphFetched("document");

  if (!requestData.document) {
    throw new Error("Dokumen tidak ditemukan");
  }

  console.log("3. Starting transaction...");
  const trx = await SignatureDetails.startTransaction();
  console.log("✓ Transaction started");

  // For user activity logging
  const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
  const userAgent = req?.headers?.["user-agent"] || null;
  let transactionId = null;
  let uploadedFilePath = null; // Track uploaded file for cleanup on rollback

  try {
    // 1. Retrieve PDF from Minio
    console.log("1. Retrieving PDF from Minio...");
    const base64File = await retrievePdfFromMinio(
      mc,
      requestData.document.file_path
    );
    console.log(
      "   ✓ PDF retrieved, size:",
      base64File ? base64File.length : 0
    );

    // 2. Load signature logo
    console.log("2. Loading logo image...");
    const imageBase64 = loadSignatureLogo();
    console.log("   ✓ Logo loaded");

    // 3. Sign document sequentially using detected coordinates
    console.log("3. Signing document sequentially with coordinates...");
    console.log("   NIK:", nik ? "***PROVIDED***" : "MISSING");
    console.log("   Passphrase:", passphrase ? "***PROVIDED***" : "MISSING");

    // Parse sign_coordinate from JSON string
    let signCoordinates = [];
    try {
      signCoordinates = userData?.sign_coordinate
        ? typeof userData.sign_coordinate === "string"
          ? JSON.parse(userData.sign_coordinate)
          : userData.sign_coordinate
        : [];
    } catch (error) {
      console.error("   ✗ Error parsing sign_coordinate:", error.message);
      throw new Error("Format sign_coordinate tidak valid");
    }

    console.log("   Coordinates to use:", signCoordinates.length, "page(s)");

    console.log("   Valid coordinates:", signCoordinates.length, "page(s)");
    signCoordinates.forEach((coord, idx) => {
      console.log(
        `     [${idx + 1}] Page ${coord.page}: bottom-left (${coord.originX}, ${
          coord.originY
        })`
      );
    });

    const startTime = Date.now();
    let sequentialResult = null;
    let bsreError = null;

    try {
      const { signDocumentSequential } = require("./signing-helpers.service");

      sequentialResult = await signDocumentSequential({
        nik,
        passphrase,
        initialBase64: base64File,
        signCoordinates: signCoordinates, // Pass coordinates array instead of pages + tag
        imageBase64,
      });

      console.log("   ✓ Sequential signing successful");
      console.log("   ✓ Completed pages:", sequentialResult.completedPages);
    } catch (error) {
      bsreError = error;
      console.error("   ✗ Sequential signing failed:", error.message);
      console.error("   ✗ Failed at page:", error.failedAtPage);
      console.error("   ✗ Completed pages:", error.completedPages);
    }

    const responseTime = Date.now() - startTime;
    console.log("   Total response time:", responseTime, "ms");

    // 4. Create BSrE transaction record
    console.log("4. Creating BSrE transaction record...");
    transactionId = nanoid();
    const now = new Date();

    // If signing failed, commit failed transaction and throw error
    if (bsreError) {
      console.log(
        "   ✗ Sequential signing failed, creating failed transaction record..."
      );

      const totalDuration =
        bsreError.pageLogs?.reduce(
          (sum, log) => sum + (log.duration_ms || 0),
          0
        ) || 0;

      await BsreTransactions.query(trx).insert({
        id: transactionId,
        signature_detail_id: detailId,
        document_id: requestData.document_id,
        original_file: requestData.document.file_path,
        signed_file: null,
        status: "failed",
        endpoint: "/api/v2/sign/pdf",
        error_message: bsreError.message,
        request_data: {
          nik,
          total_pages: userData?.sign_pages?.length || 0,
          sign_pages: userData?.sign_pages || [],
          file_size: base64File.length,
          page_logs: bsreError.pageLogs || [],
        },
        response_data: {
          error: bsreError.message,
          failed_at_page: bsreError.failedAtPage,
          failed_at_step: bsreError.failedAtStep,
          completed_pages: bsreError.completedPages,
          page_responses: bsreError.pageResponses || [],
          total_duration_ms: totalDuration,
        },
        created_at: now,
        updated_at: now,
        completed_at: null,
      });

      await trx.commit();
      console.log(
        "   ✓ Failed transaction record committed with ID:",
        transactionId
      );

      // Log BSrE interaction
      try {
        await logBsreInteraction({
          transaction_id: transactionId,
          action: "sign_document",
          endpoint: "/api/v2/sign/pdf",
          http_method: "POST",
          http_status: bsreError.statusCode || 500,
          request_payload: {
            nik,
            sign_coordinates: signCoordinates,
            tag_coordinate: userData.tag_coordinate,
            file_size: base64File.length,
          },
          response_payload: bsreError.bsreResponse || {},
          error_detail: bsreError.message,
          response_time_ms: responseTime,
        });
      } catch (logError) {
        console.error("✗ Logging error (non-critical):", logError.message);
      }

      // Log user activity
      try {
        await logSignatureAction({
          user_id: userId,
          action: "sign_document",
          signature_detail_id: detailId,
          document_id: requestData.document_id,
          document_title: requestData.document.title,
          bsre_transaction_id: transactionId,
          success: false,
          error_message: bsreError.message,
          ip_address: ipAddress,
          user_agent: userAgent,
        });
      } catch (logError) {
        console.error(
          "✗ User activity logging error (non-critical):",
          logError.message
        );
      }

      throw bsreError;
    }

    // Success case: create success transaction record
    const totalDuration = sequentialResult.pageLogs.reduce(
      (sum, log) => sum + (log.duration_ms || 0),
      0
    );

    await BsreTransactions.query(trx).insert({
      id: transactionId,
      signature_detail_id: detailId,
      document_id: requestData.document_id,
      original_file: requestData.document.file_path,
      signed_file: requestData.document.file_path,
      status: "completed",
      endpoint: "/api/v2/sign/pdf",
      error_message: null,
      request_data: {
        nik,
        total_pages: sequentialResult.totalPages,
        sign_pages: userData?.sign_pages || [],
        tag_coordinate: userData.tag_coordinate,
        file_size: base64File.length,
        page_logs: sequentialResult.pageLogs,
      },
      response_data: {
        completed_pages: sequentialResult.completedPages,
        page_responses: sequentialResult.pageResponses,
        total_duration_ms: totalDuration,
      },
      created_at: now,
      updated_at: now,
      completed_at: now,
    });
    console.log("   ✓ Transaction record created, ID:", transactionId);

    // 5. Upload signed file back to Minio (REPLACE)
    console.log("5. Uploading signed file back to Minio...");
    console.log(
      "   Final base64 size:",
      sequentialResult.finalBase64.length,
      "bytes"
    );
    uploadedFilePath = requestData.document.file_path; // Track for cleanup
    await uploadSignedPdfToMinio(
      mc,
      sequentialResult.finalBase64,
      requestData.document.file_path,
      requestData.document.document_code,
      userId
    );
    console.log(
      "   ✓ Signed file uploaded to:",
      requestData.document.file_path
    );

    // 6. Calculate new file hash and size
    console.log("6. Calculating file hash and size...");
    const signedFileBuffer = Buffer.from(
      sequentialResult.finalBase64,
      "base64"
    );
    const newFileHash = crypto
      .createHash("sha256")
      .update(signedFileBuffer)
      .digest("hex");
    const newFileSize = signedFileBuffer.length;
    console.log("   New file hash:", newFileHash);
    console.log("   New file size:", newFileSize, "bytes");
    console.log(
      "   Using finalBase64 size:",
      sequentialResult.finalBase64.length,
      "bytes (should match when converted to buffer)"
    );

    // 7. Update documents table
    console.log("7. Updating documents table...");
    await Documents.query(trx).patchAndFetchById(requestData.document_id, {
      file_hash: newFileHash,
      file_size: newFileSize,
      updated_at: new Date(),
    });
    console.log("   ✓ Documents table updated");

    // 8. Update signature detail
    console.log("8. Updating signature detail...");
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
        updated_at: new Date(),
      }
    );
    console.log("   ✓ Signature detail updated");

    // 9. Check if request is complete
    console.log("9. Checking if request is complete...");
    await checkAndCompleteRequest(detail.request_id, trx);
    console.log("   ✓ Completion check done");

    // 10. Commit transaction
    console.log("10. Committing transaction...");
    await trx.commit();
    console.log("   ✓ Transaction committed");

    // 11. Log BSrE interactions (after commit) - one per page
    console.log("11. Logging BSrE interactions...");
    try {
      for (const pageResponse of sequentialResult.pageResponses) {
        await logBsreInteraction({
          transaction_id: transactionId,
          action: "sign_document_page",
          endpoint: "/api/v2/sign/pdf",
          http_method: "POST",
          http_status: 200,
          request_payload: {
            nik,
            page: pageResponse.page,
            step: pageResponse.step,
            tag_coordinate: userData.tag_coordinate,
          },
          response_payload: pageResponse.bsre_response || {},
          error_detail: null,
          response_time_ms:
            sequentialResult.pageLogs[pageResponse.step - 1]?.duration_ms || 0,
        });
      }
      console.log(
        "   ✓ Interactions logged for",
        sequentialResult.pageResponses.length,
        "pages"
      );
    } catch (logError) {
      console.error("   ✗ Logging error (non-critical):", logError.message);
    }

    // 12. Log user activity (after commit)
    console.log("12. Logging user activity...");
    console.log("detail id:", detailId);
    console.log("transaction id:", transactionId);
    try {
      await logSignatureAction({
        user_id: userId,
        action: "sign_document",
        signature_detail_id: detailId,
        document_id: requestData.document_id,
        document_title: requestData.document.title,
        bsre_transaction_id: transactionId,
        success: true,
        error_message: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: {
          signature_pages: userData?.sign_pages,
          tag_coordinate: userData.tag_coordinate,
          total_pages: sequentialResult.totalPages,
          completed_pages: sequentialResult.completedPages,
          total_duration_ms: totalDuration,
        },
      });
      console.log("   ✓ User activity logged");
    } catch (logError) {
      console.error(
        "   ✗ User activity logging error (non-critical):",
        logError.message
      );
    }

    console.log("\n=== SIGN DOCUMENT SUCCESS ===\n");
    return updatedDetail;
  } catch (error) {
    console.error("=== SIGN DOCUMENT ERROR ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    // Cleanup: Rollback transaction and delete uploaded file
    await cleanupOnError(trx, mc, uploadedFilePath, "signDocument");

    throw error;
  }
};

/**
 * Review/approve document
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} notes - Review notes
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} - Updated signature detail
 */
export const reviewDocument = async (
  detailId,
  userId,
  notes = "",
  req = null
) => {
  const detail = await validateSignatureDetailAction(
    detailId,
    userId,
    "review"
  );

  // Start transaction
  const trx = await SignatureDetails.startTransaction();

  try {
    // Update signature detail
    const updatedDetail = await SignatureDetails.query(trx).patchAndFetchById(
      detailId,
      {
        status: "reviewed",
        signed_at: new Date(),
        notes: notes,
        updated_at: new Date(),
      }
    );

    // Check if this completes the request
    await checkAndCompleteRequest(detail.request_id, trx);

    // Commit transaction
    await trx.commit();

    // Log user activity (after commit)
    try {
      const requestData = await SignatureRequests.query()
        .findById(detail.request_id)
        .withGraphFetched("document");

      await logSignatureAction({
        user_id: userId,
        action: "review_document",
        signature_detail_id: detailId,
        document_id: requestData.document_id,
        document_title: requestData.document.title,
        success: true,
        ip_address: req?.ip || null,
        user_agent: req?.headers?.["user-agent"] || null,
        metadata: { notes },
      });
    } catch (logError) {
      console.error("User activity logging error:", logError.message);
    }

    return updatedDetail;
  } catch (error) {
    await cleanupOnError(trx, null, null, "reviewDocument");
    throw error;
  }
};

/**
 * Mark document for TTE
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} notes - Marking notes
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} - Updated signature detail
 */
export const markForTte = async (detailId, userId, notes = "", req = null) => {
  const detail = await validateSignatureDetailAction(detailId, userId, "mark");

  // Start transaction
  const trx = await SignatureDetails.startTransaction();

  try {
    // Update signature detail
    const updatedDetail = await SignatureDetails.query(trx).patchAndFetchById(
      detailId,
      {
        status: "marked_for_tte",
        is_marked_for_tte: true,
        marked_at: new Date(),
        marked_notes: notes,
        updated_at: new Date(),
      }
    );

    // Commit transaction
    await trx.commit();

    // Log user activity (after commit)
    try {
      const requestData = await SignatureRequests.query()
        .findById(detail.request_id)
        .withGraphFetched("document");

      await logSignatureAction({
        user_id: userId,
        action: "mark_for_tte",
        signature_detail_id: detailId,
        document_id: requestData.document_id,
        document_title: requestData.document.title,
        success: true,
        ip_address: req?.ip || null,
        user_agent: req?.headers?.["user-agent"] || null,
        metadata: { notes },
      });
    } catch (logError) {
      console.error("User activity logging error:", logError.message);
    }

    return updatedDetail;
  } catch (error) {
    await cleanupOnError(trx, null, null, "markForTte");
    throw error;
  }
};

/**
 * Reject document
 * @param {String} detailId - Signature detail ID
 * @param {String} userId - User ID
 * @param {String} reason - Rejection reason
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} - Updated signature detail
 */
export const rejectDocument = async (detailId, userId, reason, req = null) => {
  if (!reason || reason.trim() === "") {
    throw new Error("Alasan penolakan wajib diisi");
  }

  const detail = await validateSignatureDetailAction(
    detailId,
    userId,
    "reject"
  );

  // Start transaction
  const trx = await SignatureDetails.startTransaction();

  try {
    // Update signature detail
    const updatedDetail = await SignatureDetails.query(trx).patchAndFetchById(
      detailId,
      {
        status: "rejected",
        rejected_at: new Date(),
        rejection_reason: reason,
        updated_at: new Date(),
      }
    );

    // Update signature request status
    await SignatureRequests.query(trx).patchAndFetchById(detail.request_id, {
      status: "rejected",
      updated_at: new Date(),
    });

    // Get signature request to find document_id
    const signatureRequest = await SignatureRequests.query(trx)
      .findById(detail.request_id)
      .withGraphFetched("document");

    // Update document status
    await Documents.query(trx).patchAndFetchById(signatureRequest.document_id, {
      status: "rejected",
      updated_at: new Date(),
    });

    // Commit transaction
    await trx.commit();

    // Log user activity (after commit)
    try {
      await logSignatureAction({
        user_id: userId,
        action: "reject_document",
        signature_detail_id: detailId,
        document_id: signatureRequest.document_id,
        document_title: signatureRequest.document.title,
        success: true,
        ip_address: req?.ip || null,
        user_agent: req?.headers?.["user-agent"] || null,
        metadata: { rejection_reason: reason },
      });
    } catch (logError) {
      console.error("User activity logging error:", logError.message);
    }

    return updatedDetail;
  } catch (error) {
    await cleanupOnError(trx, null, null, "rejectDocument");
    throw error;
  }
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

  // Validation
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

  // Start transaction
  const trx = await SignatureDetails.startTransaction();

  try {
    // Update position
    const updatedDetail = await SignatureDetails.query(trx).patchAndFetchById(
      detailId,
      {
        signature_x,
        signature_y,
        signature_page,
        updated_at: new Date(),
      }
    );

    // Commit transaction
    await trx.commit();

    return updatedDetail;
  } catch (error) {
    await cleanupOnError(trx, null, null, "updateSignaturePosition");
    throw error;
  }
};

/**
 * Get document history/timeline
 * @param {String} documentId - Document ID
 * @returns {Promise<Array>} - Document history
 */
export const getDocumentHistory = async (documentId) => {
  const { getStatusLabel } = require("./workflow-helpers.service");

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
