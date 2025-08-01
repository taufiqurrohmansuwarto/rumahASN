import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { uploadRekamanVerbatim } from "@/controller/asesor-ai/verbatim.controller";
import { createRouter } from "next-connect";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .post(multer().single("file"), uploadRekamanVerbatim);

export default router.handler({});
