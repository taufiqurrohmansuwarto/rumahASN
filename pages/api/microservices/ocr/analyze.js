import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import { analyzeImageController } from "@/controller/microservices/ocr.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .post(analyzeImageController);

export default router.handler();
