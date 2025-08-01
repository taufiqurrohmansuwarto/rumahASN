import { createRouter } from "next-connect";
import auth from "middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { uploadFile } from "@/controller/siasn-instansi/token.controller";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// add setting to import images
export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const router = createRouter();

router.use(auth).use(adminMiddleware).post(upload.single("file"), uploadFile);

export default router.handler({});
