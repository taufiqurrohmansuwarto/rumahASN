import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import dmsMiddleware from "@/middleware/dms-middleware";
import { apiErrorHandler } from "@/utils/api-handler";
import { createRouter } from "next-connect";
import { getDMSScoringController } from "@/controller/dms/dms-scoring.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(checkEmployee)
  .use(dmsMiddleware)
  .get(getDMSScoringController);

export default router.handler(apiErrorHandler);
