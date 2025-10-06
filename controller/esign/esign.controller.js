require("dotenv").config();
const { verifyUserWithNik } = require("@/utils/esign-utils");
const SiasnEmployee = require("@/models/siasn-employees.model");
const { verifyPdf } = require("@/utils/esign-utils");
const Minio = require("minio");

const isProduction = process.env.NODE_ENV === "production";

// Development logging helper
const devLog = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    devLog(...args);
  }
};

const devError = (...args) => {
  if (process.env.NODE_ENV !== "production") {
    devError(...args);
  }
};

// minio
const minioConfig = {
  port: parseInt(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endPoint: process.env.MINIO_ENDPOINT,
};

const mc = new Minio.Client(minioConfig);

// remove ' from string
const removeChar = (str) => {
  return str.replace(/[^0-9]/g, "");
};

export const checkTTEUser = async (req, res) => {
  try {
    const { employee_number: nip } = req?.user;
    let nik;

    if (!isProduction) {
      nik = process.env.ESIGN_NIK;
    } else {
      const result = await SiasnEmployee.query().where("nip_baru", nip).first();
      nik = result?.nik;
    }

    const result = await verifyUserWithNik({ nik: removeChar(nik) });

    res.json(result);
  } catch (error) {
    devError("Error in checkTTEUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkQr = async (req, res) => {
  try {
    const { id: documentCode } = req.query;
    const Documents = require("@/models/esign/esign-documents.model");
    const { downloadEsignDocument } = require("@/utils/helper/minio-helper");

    if (!documentCode) {
      return res.status(400).json({
        code: 400,
        message: "Document code is required",
      });
    }

    // Cari dokumen berdasarkan document_code dengan relasi lengkap
    const document = await Documents.query()
      .where("document_code", documentCode)
      .withGraphFetched(
        "[user(simpleWithImage), signature_requests.[creator(simpleWithImage), signature_details.[user(simpleWithImage)]]]"
      )
      .first();

    if (!document) {
      return res.status(404).json({
        code: 404,
        message: "Dokumen tidak ditemukan",
      });
    }

    // Fetch file dari Minio sebagai base64
    let fileBase64 = null;
    if (document.file_path) {
      try {
        devLog("Fetching file from Minio:", document.file_path);
        fileBase64 = await downloadEsignDocument(mc, document.file_path);
        devLog("File fetched, base64 length:", fileBase64?.length);
      } catch (error) {
        devError("Error fetching file from Minio:", error);
      }
    } else {
      devLog("No file_path found in document");
    }

    // Format response untuk public view
    const response = {
      document_code: document.document_code,
      title: document.title,
      description: document.description,
      status: document.status,
      created_at: document.created_at,
      updated_at: document.updated_at,
      total_pages: document.total_pages,
      file_size: document.file_size,
      is_public: document.is_public,
      file_url: fileBase64,
      creator: {
        name: document.user?.username || document.user?.nama_master,
        image: document.user?.image,
      },
      signature_info: [],
    };

    // Tambahkan informasi signature jika ada
    if (document.signature_requests && document.signature_requests.length > 0) {
      const signatureRequest = document.signature_requests[0];

      response.signature_info = signatureRequest.signature_details.map(
        (detail) => ({
          signer_name: detail.user?.username || detail.user?.nama_master,
          signer_image: detail.user?.image,
          role_type: detail.role_type,
          status: detail.status,
          signed_at: detail.signed_at,
          sequence_order: detail.sequence_order,
        })
      );

      response.request_type = signatureRequest.request_type;
      response.request_status = signatureRequest.status;
      response.completed_at = signatureRequest.completed_at;
    }

    res.json({
      code: 200,
      message: "Dokumen berhasil diverifikasi",
      data: response,
    });
  } catch (error) {
    devError("Error in checkQr:", error);
    res.status(500).json({
      code: 500,
      message: "Internal server error",
    });
  }
};

export const verifyPdfController = async (req, res) => {
  try {
    const { file } = req?.body;
    let result;
    result = await verifyPdf({ file });

    if (result?.success) {
      const data = result?.data;
      devLog("data", data);
      res.json({ success: true, data });
    } else {
      const data = result?.data;
      res.status(500).json({ success: false, data });
    }
    res.json(result);
  } catch (error) {
    devError("Error in verifyPdf:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
