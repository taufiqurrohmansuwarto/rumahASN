import { getPemberhentianByNip } from "@/controller/rekon/rekon-pemberhentian.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import { apiErrorHandler } from "@/utils/api-handler";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .get(getPemberhentianByNip);

export default router.handler(apiErrorHandler);
