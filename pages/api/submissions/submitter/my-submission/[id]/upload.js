import asnFasilitatorMiddleware from "@/middleware/asn-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import multer from "multer";
import { uploadSubmissionsFile } from "@/controller/submissions.controller";
const router = createRouter();

export const config = {
  api: {
    bodyParser: false,
  },
};

router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .post(multer().single("file"), uploadSubmissionsFile);

export default router.handler({});
