import { uploadMultipleFiles } from "@/controller/rasn-mail/upload.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import multer from "multer";

// Konfigurasi multer untuk multiple files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
    files: 10, // Maximum 10 files at once
  },
});

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .use(upload.array("files", 10))
  .post(uploadMultipleFiles);

export default router.handler({
  onError: (err, req, res) => {
    console.error("Multiple upload API error:", err);
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Salah satu file terlalu besar. Maksimal 25MB per file",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Terlalu banyak file. Maksimal 10 file sekaligus",
        });
      }
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};
