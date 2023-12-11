import {
  listKenaikanPangkat,
  uploadDokumenKenaikanPangkat,
} from "@/controller/siasn-kp.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(siasnMiddleware)
  .post(multer().single("file"), uploadDokumenKenaikanPangkat);

export default router.handler();
