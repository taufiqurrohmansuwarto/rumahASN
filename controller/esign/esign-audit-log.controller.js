const {
  getDocumentLogs,
  getAllDocumentLogs,
  getUserActivityLogs,
} = require("../../services/esign-audit-log.services");
const Document = require("../../models/esign/esign-documents.model");
const SignatureDetail = require("../../models/esign/esign-signature-details.model");
const { log } = require("@/utils/logger");

/**
 * Get audit logs for a specific document
 * GET /api/esign-bkd/documents/:documentId/logs
 *
 * Authorization:
 * - Document owner (created_by)
 * - Users in signature_details (signers/reviewers)
 */
const getDocumentAuditLogs = async (req, res) => {
  try {
    const { id: documentId } = req?.query;
    const { page = 1, limit = 20 } = req.query;
    const userId = req?.user?.customId;

    if (!documentId) {
      return res.status(400).json({ message: "Document ID is required" });
    }

    // Check if user has access to this document
    const document = await Document.query().findById(documentId);

    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    // Check if user is document owner
    const isOwner = document.created_by === userId;

    // Check if user is in signature_details
    const signatureDetail = await SignatureDetail.query()
      .where("user_id", userId)
      .whereIn("request_id", function () {
        this.select("id")
          .from("esign.signature_requests")
          .where("document_id", documentId);
      })
      .first();

    const isParticipant = !!signatureDetail;

    // User must be either owner or participant
    if (!isOwner && !isParticipant) {
      return res.status(403).json({
        message: "Anda tidak memiliki akses untuk melihat riwayat dokumen ini",
      });
    }

    const result = await getAllDocumentLogs({
      documentId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    log.error("Error getting document audit logs:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user activity logs
 * GET /api/esign-bkd/logs/my-activity
 */
const getMyActivityLogs = async (req, res) => {
  try {
    const userId = req?.user?.customId;
    const { action, page = 1, limit = 20 } = req.query;

    const result = await getUserActivityLogs({
      userId,
      action,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    log.error("Error getting user activity logs:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDocumentAuditLogs,
  getMyActivityLogs,
};
