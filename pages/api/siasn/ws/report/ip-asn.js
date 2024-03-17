import { showIPASN, uploadIPASN } from "@/controller/siasn-report.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();
import multer from "multer";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

router
  .use(auth)
  .use(adminMiddleware)
  .get(showIPASN)
  .post(multer().single("file"), uploadIPASN);

export default router.handler();
