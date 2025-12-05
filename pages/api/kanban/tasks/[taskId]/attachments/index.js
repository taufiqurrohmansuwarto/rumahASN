import {
  getAttachments,
  uploadAttachment,
} from "@/controller/kanban/attachments.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import multer from "multer";
import { createRouter } from "next-connect";

export const config = {
  api: {
    bodyParser: false,
  },
};

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
  .use(asnNonAsnMiddleware)
  .get(getAttachments)
  .post(upload.single("file"), uploadAttachment);

export default router.handler({});
