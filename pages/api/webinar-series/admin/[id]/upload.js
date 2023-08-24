import { uploadTemplateAndImage } from "@/controller/webinar-series.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import multer from "multer";

import { createRouter } from "next-connect";
const router = createRouter();

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

router
  .use(auth)
  .use(adminMiddleware)
  .post(multer().single("file"), uploadTemplateAndImage);

export default router.handler({});
