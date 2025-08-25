import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import multer from "multer";
import { uploadKnowledgeContentAttachment } from "@/controller/knowledge/knowledge-contents.controller";

const router = createRouter();

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.memoryStorage(),
});

router.use(auth).post(upload.array("file"), uploadKnowledgeContentAttachment);

export default router.handler({});
