import {
  uploadAttachment,
  deleteAttachment,
} from "@/controller/pengadaan/document-revisions.controller";
import auth from "@/middleware/auth.middleware";
import asnMasterMiddleware from "@/middleware/asn-master.middleware";
import { createRouter } from "next-connect";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDF
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Tipe file tidak diizinkan. Gunakan JPG, PNG, GIF, atau PDF.")
      );
    }
  },
});

const router = createRouter();

router
  .use(auth)
  .use(asnMasterMiddleware)
  .post(upload.single("file"), uploadAttachment)
  .delete(deleteAttachment);

export default router.handler({});

export const config = {
  api: {
    bodyParser: false,
  },
};
