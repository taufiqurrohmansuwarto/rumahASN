/**
 * Workflow Helper Functions
 * Validation and completion logic untuk signature workflow
 */

const SignatureDetails = require("@/models/esign/esign-signature-details.model");
const SignatureRequests = require("@/models/esign/esign-signature-requests.model");
const Documents = require("@/models/esign/esign-documents.model");

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
 * @param {Object} trx - Transaction object (optional)
 * @returns {Promise<Boolean>} - True if completed
 */
export const checkAndCompleteRequest = async (requestId, trx = null) => {
  console.log("   [checkAndCompleteRequest] Checking request:", requestId);
  console.log("   [checkAndCompleteRequest] Using transaction:", trx ? "YES" : "NO");

  // Get ALL signature details for this request to see the full picture
  const allDetailsQuery = SignatureDetails.query()
    .where("request_id", requestId)
    .select("id", "user_id", "status", "sequence_order");

  if (trx) allDetailsQuery.transacting(trx);
  const allDetails = await allDetailsQuery;

  console.log(
    "   [checkAndCompleteRequest] All details:",
    allDetails.map((d) => `[${d.sequence_order}] ${d.status}`).join(", ")
  );

  // Query pending details
  const pendingQuery = SignatureDetails.query()
    .where("request_id", requestId)
    .where("status", "waiting");

  if (trx) pendingQuery.transacting(trx);
  const pendingDetails = await pendingQuery;

  // Query rejected details
  const rejectedQuery = SignatureDetails.query()
    .where("request_id", requestId)
    .where("status", "rejected");

  if (trx) rejectedQuery.transacting(trx);
  const rejectedDetails = await rejectedQuery;

  console.log(
    "   [checkAndCompleteRequest] Pending details:",
    pendingDetails.length
  );
  console.log(
    "   [checkAndCompleteRequest] Rejected details:",
    rejectedDetails.length
  );

  // If no pending and no rejected, complete the request
  if (pendingDetails.length === 0 && rejectedDetails.length === 0) {
    console.log(
      "   [checkAndCompleteRequest] All steps completed! Marking request as completed..."
    );

    // Update signature request
    const updateRequestQuery = SignatureRequests.query();
    if (trx) updateRequestQuery.transacting(trx);

    await updateRequestQuery.patchAndFetchById(requestId, {
      status: "completed",
      completed_at: new Date(),
      updated_at: new Date(),
    });

    // Get signature request to find document_id
    const findRequestQuery = SignatureRequests.query().findById(requestId);
    if (trx) findRequestQuery.transacting(trx);

    const signatureRequest = await findRequestQuery;

    console.log(
      "   [checkAndCompleteRequest] Updating document:",
      signatureRequest.document_id
    );

    // Update document status
    const updateDocQuery = Documents.query();
    if (trx) updateDocQuery.transacting(trx);

    await updateDocQuery.patchAndFetchById(signatureRequest.document_id, {
      status: "signed",
      updated_at: new Date(),
    });

    console.log(
      "   [checkAndCompleteRequest] ✓ Request and document completed!"
    );
    return true;
  }

  console.log(
    "   [checkAndCompleteRequest] Still waiting for other signatures"
  );
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
