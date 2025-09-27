import { handleError } from "@/utils/helper/controller-helper";
import {
  createBsreTransaction,
  sendToBsre,
  checkBsreStatus,
  handleBsreCallback,
  retryBsreTransaction,
  getBsreTransactions,
  getBsreTransactionById,
  getBsreTransactionStats
} from "@/utils/services/esign/bsre-transactions.service";

// ==========================================
// BSRE TRANSACTION CRUD ENDPOINTS
// ==========================================

export const create = async (req, res) => {
  try {
    const { signature_detail_id, document_id } = req.body;
    const mc = req?.mc;

    const transaction = await createBsreTransaction(signature_detail_id, document_id, req.body, mc);

    res.status(201).json({
      message: "Transaksi BSrE berhasil dibuat",
      data: transaction,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const findAll = async (req, res) => {
  try {
    const result = await getBsreTransactions(req.query);

    res.json({
      message: "Data transaksi BSrE berhasil diambil",
      ...result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const findOne = async (req, res) => {
  try {
    const { id } = req.query;

    const transaction = await getBsreTransactionById(id);

    res.json({
      message: "Detail transaksi BSrE berhasil diambil",
      data: transaction,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// BSRE INTEGRATION ENDPOINTS
// ==========================================

export const signDocument = async (req, res) => {
  try {
    const { id } = req.query;
    const { user_certificate } = req.body;
    const mc = req?.mc;

    const bsreResponse = await sendToBsre(id, user_certificate, mc);

    res.json({
      message: "Dokumen berhasil dikirim ke BSrE untuk ditandatangani",
      data: bsreResponse,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const checkStatus = async (req, res) => {
  try {
    const { bsre_id } = req.query;

    const statusResponse = await checkBsreStatus(bsre_id);

    res.json({
      message: "Status BSrE berhasil diperiksa",
      data: statusResponse,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const callback = async (req, res) => {
  try {
    const mc = req?.mc;

    const result = await handleBsreCallback(req.body, mc);

    res.json({
      message: "Callback BSrE berhasil diproses",
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const retry = async (req, res) => {
  try {
    const { id } = req.query;
    const { user_certificate } = req.body;
    const mc = req?.mc;

    const retryResponse = await retryBsreTransaction(id, user_certificate, mc);

    res.json({
      message: "Transaksi BSrE berhasil dicoba ulang",
      data: retryResponse,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ==========================================
// UTILITY ENDPOINTS
// ==========================================

export const getStats = async (req, res) => {
  try {
    const stats = await getBsreTransactionStats(req.query);

    res.json({
      message: "Statistik transaksi BSrE berhasil diambil",
      data: stats,
    });
  } catch (error) {
    handleError(res, error);
  }
};