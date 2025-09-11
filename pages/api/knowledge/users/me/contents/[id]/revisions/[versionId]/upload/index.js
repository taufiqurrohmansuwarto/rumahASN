import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { uploadRevisionAttachments } from "@/controller/knowledge/knowledge-revisions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 300, // 5 minutes timeout
};

const router = createRouter();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // max 5 files
  },
});

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .post(upload.array("files"), uploadRevisionAttachments);

export default router.handler({});
