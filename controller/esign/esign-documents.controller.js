import { handleError } from "@/utils/helper/controller-helper";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocumentFile,
  previewDocumentFile,
} from "@/utils/services/esign/documents.service";
import {
  logDocumentActivity,
  logUserActivity,
} from "../../services/esign-audit-log.services";

const { log } = require("@/utils/logger");

export const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const mc = req?.mc;

    log.info("[Controller] req.body:", req.body);
    log.info("[Controller] req.body.is_add_footer:", req.body.is_add_footer, "type:", typeof req.body.is_add_footer);

    // Convert string boolean to actual boolean
    const bodyData = {
      ...req.body,
      is_public: req.body.is_public === "true" || req.body.is_public === true,
      is_add_footer: req.body.is_add_footer === "true" || req.body.is_add_footer === true,
    };

    log.info("[Controller] bodyData.is_add_footer:", bodyData.is_add_footer, "type:", typeof bodyData.is_add_footer);

    const document = await createDocument(bodyData, req.file, userId, mc);

    // Log upload activity
    await logDocumentActivity({
      documentId: document.id,
      userId,
      action: "upload",
      req,
    });

    await logUserActivity({
      userId,
      action: "upload_document",
      entityType: "document",
      entityId: document.id,
      additionalData: {
        title: document.title,
        description: document.description,
      },
      req,
    });

    res.status(201).json({
      message: "Dokumen berhasil dibuat",
      data: document,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const findAll = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const result = await getDocuments(userId, req.query);

    res.json({
      message: "Data dokumen berhasil diambil",
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

    const document = await getDocumentById(id, userId);

    res.json({
      message: "Detail dokumen berhasil diambil",
      data: document,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;

    const updatedDocument = await updateDocument(id, req.body, userId);

    res.json({
      message: "Dokumen berhasil diperbarui",
      data: updatedDocument,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const destroy = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const mc = req?.mc;

    await deleteDocument(id, userId, mc);

    res.json({
      message: "Dokumen berhasil dihapus",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const download = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id } = req.query;
    const mc = req?.mc;

    const fileData = await downloadDocumentFile(id, userId, mc);

    // Log download activity
    await logDocumentActivity({
      documentId: id,
      userId,
      action: "download",
      req,
    });

    await logUserActivity({
      userId,
      action: "download_document",
      entityType: "document",
      entityId: id,
      req,
    });

    res.json({
      message: "File berhasil didownload",
      data: fileData,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const preview = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { id, format } = req.query;
    const mc = req?.mc;

    const { fileBuffer, totalPages } = await previewDocumentFile(
      id,
      userId,
      mc
    );

    // Log preview activity
    await logDocumentActivity({
      documentId: id,
      userId,
      action: "view",
      req,
    });

    await logUserActivity({
      userId,
      action: "view_document",
      entityType: "document",
      entityId: id,
      req,
    });

    // Jika format=base64, return sebagai JSON dengan base64
    if (format === "base64") {
      const base64Data = fileBuffer.toString("base64");

      res.setHeader("Content-Type", "application/json");
      res.json({
        success: true,
        data: {
          content: base64Data,
          contentType: "application/pdf",
          size: fileBuffer.length,
          totalPages: totalPages,
        },
      });
    } else {
      // Default: return sebagai PDF binary
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Content-Length", fileBuffer.length);
      res.send(fileBuffer);
    }
  } catch (error) {
    handleError(res, error);
  }
};
