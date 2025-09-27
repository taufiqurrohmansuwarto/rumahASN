import { handleError } from "@/utils/helper/controller-helper";
import {
  getPendingDocuments,
  getMarkedForTteDocuments,
  getRejectedDocuments,
  getCompletedDocuments,
  reviewDocument,
  markForTte,
  signDocument,
  rejectDocument,
  getDocumentHistory,
  updateSignaturePosition,
  countMarkedDocuments
} from "@/utils/services/esign/signature-details.service";

// ==========================================
// DASHBOARD TAB ENDPOINTS
// ==========================================

export const getPending = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const result = await getPendingDocuments(userId, req.query);

    res.json({
      message: "Data dokumen pending berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getMarkedForTte = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const result = await getMarkedForTteDocuments(userId, req.query);

    res.json({
      message: "Data dokumen siap TTE berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getRejected = async (req, res) => {
  try {
    const result = await getRejectedDocuments(req.query);

    res.json({
      message: "Data dokumen ditolak berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getCompleted = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const result = await getCompletedDocuments(userId, req.query);

    res.json({
      message: "Data dokumen selesai berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// WORKFLOW ACTION ENDPOINTS
// ==========================================

export const reviewDoc = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { notes } = req.body;

    const updatedDetail = await reviewDocument(id, userId, notes);

    res.json({
      message: "Dokumen berhasil direview",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const markForTteDoc = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { notes } = req.body;

    const updatedDetail = await markForTte(id, userId, notes);

    res.json({
      message: "Dokumen berhasil ditandai siap TTE",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const signDoc = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    const updatedDetail = await signDocument(id, userId, req.body);

    res.json({
      message: "Dokumen berhasil ditandatangani",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const rejectDoc = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const { reason } = req.body;

    const updatedDetail = await rejectDocument(id, userId, reason);

    res.json({
      message: "Dokumen berhasil ditolak",
      data: updatedDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// UTILITY ENDPOINTS
// ==========================================

export const getHistory = async (req, res) => {
  try {
    const { document_id } = req.query;

    const history = await getDocumentHistory(document_id);

    res.json({
      message: "Riwayat dokumen berhasil diambil",
      data: history,
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

export const getMarkedCount = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const count = await countMarkedDocuments(userId);

    res.json({
      message: "Jumlah dokumen siap TTE berhasil diambil",
      data: { count },
    });
  } catch (error) {
    handleError(res, error);
  }
};