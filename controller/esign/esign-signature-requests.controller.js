import { handleError } from "@/utils/helper/controller-helper";
import {
  createSignatureRequest,
  getSignatureRequests,
  getSignatureRequestById,
  updateSignatureRequest,
  cancelSignatureRequest,
  getWorkflowStatus,
  completeSignatureRequest,
  getSignatureRequestStats,
} from "@/utils/services/esign/signature-requests.service";
import {
  reviewDocument,
  markForTte,
  signDocument,
  rejectDocument,
  updateSignaturePosition,
} from "@/utils/services/esign/signature-details.service";
import {
  logDocumentActivity,
  logUserActivity,
} from "@/services/esign-audit-log.services";

const SiasnEmployee = require("@/models/siasn-employees.model");

const removeChar = (str) => {
  return str.replace(/[^0-9]/g, "");
};

export const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const document_id = req.body?.documentId;
    const data = req.body?.data;
    console.log("data", data);

    const signatureRequest = await createSignatureRequest(
      document_id,
      data,
      userId
    );

    res.status(201).json({
      message: "Pengajuan TTE berhasil dibuat",
      data: signatureRequest,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const findAll = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const result = await getSignatureRequests(userId, req.query);

    res.json({
      message: "Data pengajuan TTE berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const findOne = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    const signatureRequest = await getSignatureRequestById(id, userId);

    res.json({
      message: "Detail pengajuan TTE berhasil diambil",
      data: signatureRequest,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    const updatedRequest = await updateSignatureRequest(id, req.body, userId);

    res.json({
      message: "Pengajuan TTE berhasil diperbarui",
      data: updatedRequest,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const cancel = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    await cancelSignatureRequest(id, userId);

    res.json({
      message: "Pengajuan TTE berhasil dibatalkan",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getWorkflow = async (req, res) => {
  try {
    const { id } = req.query;

    const workflow = await getWorkflowStatus(id);

    res.json({
      message: "Status alur kerja berhasil diambil",
      data: workflow,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const complete = async (req, res) => {
  try {
    const { id } = req.query;

    const completedRequest = await completeSignatureRequest(id);

    res.json({
      message: "Pengajuan TTE berhasil diselesaikan",
      data: completedRequest,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getStats = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const stats = await getSignatureRequestStats(userId);

    res.json({
      message: "Statistik pengajuan TTE berhasil diambil",
      data: stats,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// WORKFLOW ACTION ENDPOINTS
// ==========================================

export const review = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { notes } = req.body;

    const updatedDetail = await reviewDocument(id, userId, notes);

    // Log review activity
    const signatureRequest = await getSignatureRequestById(updatedDetail.request_id, userId);
    const documentId = signatureRequest.document_id;

    await logDocumentActivity({
      documentId,
      userId,
      action: "review",
      req,
    });

    await logUserActivity({
      userId,
      action: "review_document",
      entityType: "signature_request",
      entityId: id,
      additionalData: { notes },
      req,
    });

    res.json({
      message: "Dokumen berhasil direview",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const mark = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { notes } = req.body;

    const updatedDetail = await markForTte(id, userId, notes);

    // Log mark for TTE activity
    const signatureRequest = await getSignatureRequestById(updatedDetail.request_id, userId);
    const documentId = signatureRequest.document_id;

    await logDocumentActivity({
      documentId,
      userId,
      action: "mark_for_tte",
      req,
    });

    await logUserActivity({
      userId,
      action: "mark_for_tte",
      entityType: "signature_request",
      entityId: id,
      additionalData: { notes },
      req,
    });

    res.json({
      message: "Dokumen berhasil ditandai siap TTE",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const sign = async (req, res) => {
  try {
    const { mc } = req;
    const { customId: userId, employee_number: nip } = req?.user;
    const { id } = req.query;

    let nik;
    if (process.env.NODE_ENV === "production") {
      nik = process.env.ESIGN_NIK;
    } else {
      if (!nip) {
        throw new Error("NIP tidak ditemukan di session");
      }
      const result = await SiasnEmployee.query().where("nip_baru", nip).first();
      if (!result?.nik) {
        throw new Error("NIK tidak ditemukan untuk NIP: " + nip);
      }
      nik = removeChar(result.nik);
    }

    const data = req.body;

    const updatedDetail = await signDocument(id, userId, { ...data, nik }, mc);

    // Log sign activity
    const signatureRequest = await getSignatureRequestById(updatedDetail.request_id, userId);
    const documentId = signatureRequest.document_id;

    await logDocumentActivity({
      documentId,
      userId,
      action: "sign",
      req,
    });

    await logUserActivity({
      userId,
      action: "sign_document",
      entityType: "signature_request",
      entityId: id,
      req,
    });

    res.json({
      message: "Dokumen berhasil ditandatangani",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const reject = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { reason } = req.body;

    const updatedDetail = await rejectDocument(id, userId, reason);

    // Log reject activity
    const signatureRequest = await getSignatureRequestById(updatedDetail.request_id, userId);
    const documentId = signatureRequest.document_id;

    await logDocumentActivity({
      documentId,
      userId,
      action: "reject",
      req,
    });

    await logUserActivity({
      userId,
      action: "reject_document",
      entityType: "signature_request",
      entityId: id,
      additionalData: { reason },
      req,
    });

    res.json({
      message: "Dokumen berhasil ditolak",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updatePosition = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    const updatedDetail = await updateSignaturePosition(id, userId, req.body);

    res.json({
      message: "Posisi tanda tangan berhasil diperbarui",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getSignatureRequestHistory = async (req, res) => {
  try {
    const { id } = req.query;

    const SignatureDetails = require("@/models/esign/esign-signature-details.model");

    // Get history from signature_details with status changes
    const history = await SignatureDetails.query()
      .where("request_id", id)
      .withGraphFetched("user(simpleWithImage)")
      .orderBy("updated_at", "asc");

    // Transform to history format
    const historyData = history.map((detail) => ({
      id: detail.id,
      action_type: getActionType(detail.role_type, detail.status),
      status: detail.status,
      status_text: getStatusText(detail.status),
      user: detail.user,
      notes: detail.notes || detail.rejection_reason,
      created_at: detail.updated_at || detail.created_at,
    }));

    res.json({
      message: "Riwayat pengajuan TTE berhasil diambil",
      data: historyData,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Helper functions for history
function getActionType(roleType, status) {
  if (status === "waiting") return "Menunggu";
  if (status === "rejected") return "Ditolak";
  if (status === "signed")
    return roleType === "signer" ? "Ditandatangani" : "Disetujui";
  if (status === "reviewed") return "Direview";
  if (status === "marked_for_tte") return "Ditandai untuk TTE";
  return "Aksi";
}

function getStatusText(status) {
  const statusMap = {
    waiting: "Menunggu",
    signed: "Ditandatangani",
    reviewed: "Direview",
    rejected: "Ditolak",
    marked_for_tte: "Ditandai untuk TTE",
  };
  return statusMap[status] || status;
}

export const getPendingRequests = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      getPendingSignatureRequests,
    } = require("@/utils/services/esign/signature-requests.service");

    const result = await getPendingSignatureRequests(userId, req.query);

    res.json({
      message: "Data permintaan TTE yang menunggu aksi berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};
