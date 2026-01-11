import { getDMSScoringControllerByNip } from "@/controller/dms/dms-scoring.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import dmsMiddleware from "@/middleware/dms-middleware";
import { apiErrorHandler } from "@/utils/api-handler";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .use(dmsMiddleware)
  .get(getDMSScoringControllerByNip);

export default router.handler(apiErrorHandler);
