import { uploadFile } from "@/controller/rasn-mail/upload.controller";
import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import multer from "multer";

// Konfigurasi multer untuk memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
});

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnFasilitatorMiddleware)
  .use(upload.single("file"))
  .post(uploadFile);

export default router.handler({
  onError: (err, req, res) => {
    console.error("Upload API error:", err);
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File terlalu besar. Maksimal 25MB",
        });
      }
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  },
});
