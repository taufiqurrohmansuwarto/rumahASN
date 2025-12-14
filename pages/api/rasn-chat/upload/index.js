import { uploadChatFile } from "@/controller/rasn-chat.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import multer from "multer";
import { createRouter } from "next-connect";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Allowed file types
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  // Microsoft Office
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  // LibreOffice / OpenDocument
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.presentation", // .odp
  // Text
  "text/plain",
  "text/csv",
  // Archive
  "application/zip",
  "application/x-rar-compressed",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/webm",
  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipe file tidak didukung. File yang didukung: gambar, PDF, dokumen Office (Word, Excel, PowerPoint), dan file teks."
      ),
      false
    );
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB untuk office files
  },
  fileFilter,
});

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .post(upload.single("file"), uploadChatFile);

export default router.handler({
  onError: (err, req, res) => {
    res.status(400).json({ message: err.message });
  },
});

