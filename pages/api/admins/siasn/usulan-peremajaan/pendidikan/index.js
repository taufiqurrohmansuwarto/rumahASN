import { createRouter } from "next-connect";
import auth from "middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createUsulanPeremajaanPendidikan } from "@/controller/siasn-instansi/token.controller";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const router = createRouter();

router.use(auth).use(adminMiddleware).post(createUsulanPeremajaanPendidikan);

export default router.handler({});
