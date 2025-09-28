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

export const create = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const mc = req?.mc;

    const document = await createDocument(req.body, req.file, userId, mc);

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

    const fileBuffer = await previewDocumentFile(id, userId, mc);

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
