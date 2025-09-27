import { handleError } from "@/utils/helper/controller-helper";
import {
  createSignatureRequest,
  getSignatureRequests,
  getSignatureRequestById,
  updateSignatureRequest,
  cancelSignatureRequest,
  getWorkflowStatus,
  completeSignatureRequest,
  getSignatureRequestStats
} from "@/utils/services/esign/signature-requests.service";

export const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { document_id } = req.body;

    const signatureRequest = await createSignatureRequest(document_id, req.body, userId);

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