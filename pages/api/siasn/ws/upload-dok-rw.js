import { uplaodDokRwSIASN } from "@/controller/siasn-document.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { apiErrorHandler } from "@/utils/api-handler";
import { createRouter } from "next-connect";
import multer from "multer";
const router = createRouter();

export const config = {
  api: {
    bodyParser: false,
  },
};

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(siasnMiddleware)
  .post(multer().single("file"), uplaodDokRwSIASN);

export default router.handler(apiErrorHandler);
