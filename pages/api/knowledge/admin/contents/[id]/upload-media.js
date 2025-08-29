import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import multer from "multer";
import { uploadKnowledgeContentMediaAdmin } from "@/controller/knowledge/knowledge-contents.controller";

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
    fileSize: 100 * 1024 * 1024, // 100MB for media files
    files: 1, // single media file
  },
});

router
  .use(auth)
  .use(adminMiddleware)
  .post(upload.single("media"), uploadKnowledgeContentMediaAdmin);

export default router.handler({});