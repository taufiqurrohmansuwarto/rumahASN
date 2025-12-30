import {
  getAttachments,
  uploadAttachment,
} from "@/controller/rasn-naskah/upload.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getAttachments).post(upload.single("file"), uploadAttachment);

export default router.handler({});

export const config = {
  api: {
    bodyParser: false,
  },
};

