import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import { unggahDokumenSiasn } from "@/controller/siasn/dokumen.controller";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .post(multer().single("file"), unggahDokumenSiasn);

export default router.handler();
