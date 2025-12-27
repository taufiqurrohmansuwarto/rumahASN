import { uploadDocument } from "@/controller/rasn-naskah/upload.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for documents
  },
});

const router = createRouter();

router.use(auth).post(upload.single("file"), uploadDocument);

export default router.handler({});

export const config = {
  api: {
    bodyParser: false,
  },
};

