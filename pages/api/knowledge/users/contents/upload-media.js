import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { uploadKnowledgeContentMediaCreate } from "@/controller/knowledge/knowledge-contents.controller";
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
    fileSize: 100 * 1024 * 1024, // 100MB for media files
    files: 1, // single media file
  },
});

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .post(upload.single("media"), uploadKnowledgeContentMediaCreate);

export default router.handler({});