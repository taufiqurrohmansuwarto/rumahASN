import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import multer from "multer";
import { uploadKnowledgeContentAttachmentAdmin } from "@/controller/knowledge/knowledge-contents.controller";

const router = createRouter();

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
  maxDuration: 300, // 5 minutes timeout
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // max 5 files
  },
});

router
  .use(auth)
  .use(adminMiddleware)
  .post(upload.array("files"), uploadKnowledgeContentAttachmentAdmin);

export default router.handler({});
