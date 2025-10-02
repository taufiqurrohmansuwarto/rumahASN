const {
  getDocumentLogs,
  getAllDocumentLogs,
  getUserActivityLogs,
} = require("../../services/esign-audit-log.services");

/**
 * Get audit logs for a specific document
 * GET /api/esign-bkd/documents/:documentId/logs
 */
const getDocumentAuditLogs = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await getAllDocumentLogs({
      documentId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting document audit logs:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get user activity logs
 * GET /api/esign-bkd/logs/my-activity
 */
const getMyActivityLogs = async (req, res) => {
  try {
    const userId = req.user?.current_user?.custom_id;
    const { action, page = 1, limit = 20 } = req.query;

    const result = await getUserActivityLogs({
      userId,
      action,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json(result);
  } catch (error) {
    console.error("Error getting user activity logs:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDocumentAuditLogs,
  getMyActivityLogs,
};
