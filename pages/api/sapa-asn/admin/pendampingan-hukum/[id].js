import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import {
  getById,
  updateStatus,
} from "@/controller/sapa-asn/admin/pendampingan-hukum.controller";
import multer from "multer";

// Disable body parser untuk multer
export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOC files are allowed"));
    }
  },
});

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getById)
  .patch(upload.single("attachment_disposisi"), updateStatus);

export default router.handler();

