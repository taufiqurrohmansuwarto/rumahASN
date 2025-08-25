import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { uploadKnowledgeContentAttachment } from "@/controller/knowledge/knowledge-contents.controller";

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

router.use(auth).post(upload.array("files"), uploadKnowledgeContentAttachment);

export default router.handler({});
