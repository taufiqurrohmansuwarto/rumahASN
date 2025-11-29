import multer from "multer";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  getAll,
  create,
} from "@/controller/sapa-asn/users/konsultasi-hukum.controller";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 3,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file PDF atau DOC/DOCX yang diperbolehkan"), false);
    }
  },
});

const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(getAll)
  .post(upload.array("lampiran", 3), create);

export default router.handler();

