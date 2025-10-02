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
    console.log("   ✓ PDF retrieved, size:", base64File ? base64File.length : 0);

    // 2. Load signature logo
    console.log("2. Loading logo image...");
    const imageBase64 = loadSignatureLogo();
    console.log("   ✓ Logo loaded");

    // 3. Prepare signature properties
    console.log("3. Preparing signature properties...");
    const signatureProperties = prepareSignatureProperties(
      userData?.sign_pages,
      userData.tag_coordinate,
      imageBase64
    );
    console.log("   Signature properties:", signatureProperties);

    // 4. Call BSrE API to sign document
    console.log("4. Calling BSrE API to sign document...");
    console.log("   NIK:", nik ? "***PROVIDED***" : "MISSING");
    console.log("   Passphrase:", passphrase ? "***PROVIDED***" : "MISSING");

    const startTime = Date.now();
    let signResult = null;
    let bsreError = null;

    try {
      const { signedFileBase64, result } = await callBsreSignApi({
        nik,
        passphrase,
        base64File,
        signatureProperties,
      });
      signResult = { signedFileBase64, result };
      console.log("   ✓ BSrE signing successful");
    } catch (error) {
      bsreError = error;
      console.error("   ✗ BSrE signing failed:", error.message);
    }

    const responseTime = Date.now() - startTime;
    console.log("   Response time:", responseTime, "ms");

    // 5. Create BSrE transaction record
    console.log("5. Creating BSrE transaction record...");
    transactionId = nanoid();
    const now = new Date();

    // If signing failed, commit failed transaction and throw error
    if (bsreError) {
      console.log(
        "   ✗ BSrE signing failed, creating failed transaction record..."
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
          nik,
          signatureProperties,
          file_size: base64File.length,
        },
        response_data: {},
        created_at: now,
        updated_at: now,
        completed_at: null,
      });

      await trx.commit();
      console.log("   ✓ Failed transaction record committed");

      // Log BSrE interaction
      try {
        await logBsreInteraction({
          transaction_id: transactionId,
          action: "sign_document",
          endpoint: "/sign/coordinate",
          http_method: "POST",
          http_status: 500,
          request_payload: {
            nik,
            signatureProperties,
            file_size: base64File.length,
          },
          response_payload: {},
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
    await BsreTransactions.query(trx).insert({
      id: transactionId,
      signature_detail_id: detailId,
      document_id: requestData.document_id,
      original_file: requestData.document.file_path,
      signed_file: requestData.document.file_path,
      status: "completed",
      error_message: null,
      request_data: { nik, signatureProperties, file_size: base64File.length },
      response_data: signResult?.result || {},
      created_at: now,
      updated_at: now,
      completed_at: now,
    });
    console.log("   ✓ Transaction record created, ID:", transactionId);

    // 6. Upload signed file back to Minio (REPLACE)
    console.log("6. Uploading signed file back to Minio...");
    uploadedFilePath = requestData.document.file_path; // Track for cleanup
    await uploadSignedPdfToMinio(
      mc,
      signResult.signedFileBase64,
      requestData.document.file_path,
      requestData.document.document_code,
      userId
    );
    console.log("   ✓ Signed file uploaded");

    // 7. Calculate new file hash and size
    console.log("7. Calculating file hash and size...");
    const signedFileBuffer = Buffer.from(signResult.signedFileBase64, "base64");
    const newFileHash = crypto
      .createHash("sha256")
      .update(signedFileBuffer)
      .digest("hex");
    const newFileSize = signedFileBuffer.length;
    console.log("   New file hash:", newFileHash);
    console.log("   New file size:", newFileSize, "bytes");

    // 8. Update documents table
    console.log("8. Updating documents table...");
    await Documents.query(trx).patchAndFetchById(requestData.document_id, {
      file_hash: newFileHash,
      file_size: newFileSize,
      updated_at: new Date(),
    });
    console.log("   ✓ Documents table updated");

    // 9. Update signature detail
    console.log("9. Updating signature detail...");
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

    // 10. Check if request is complete
    console.log("10. Checking if request is complete...");
    await checkAndCompleteRequest(detail.request_id, trx);
    console.log("   ✓ Completion check done");

    // 11. Commit transaction
    console.log("11. Committing transaction...");
    await trx.commit();
    console.log("   ✓ Transaction committed");

    // 12. Log BSrE interaction (after commit)
    console.log("12. Logging BSrE interaction...");
    try {
      await logBsreInteraction({
        transaction_id: transactionId,
        action: "sign_document",
        endpoint: "/sign/coordinate",
        http_method: "POST",
        http_status: 200,
        request_payload: {
          nik,
          signatureProperties,
          file_size: base64File.length,
        },
        response_payload: signResult?.result || {},
        error_detail: null,
        response_time_ms: responseTime,
      });
      console.log("   ✓ Interaction logged");
    } catch (logError) {
      console.error("   ✗ Logging error (non-critical):", logError.message);
    }

    // 13. Log user activity (after commit)
    console.log("13. Logging user activity...");
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
