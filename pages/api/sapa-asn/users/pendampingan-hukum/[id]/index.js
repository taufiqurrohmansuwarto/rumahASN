import multer from "multer";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  getById,
  update,
  cancel,
} from "@/controller/sapa-asn/users/pendampingan-hukum.controller";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
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
  .get(getById)
  .put(upload.array("lampiran", 5), update)
  .delete(cancel);

export default router.handler();
