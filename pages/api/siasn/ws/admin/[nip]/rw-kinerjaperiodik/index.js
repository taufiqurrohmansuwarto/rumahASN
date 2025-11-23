import {
  kinerjaPeriodikByNip,
  tambahKinerjaPeridoikByNip,
} from "@/controller/siasn.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import { apiErrorHandler } from "@/utils/api-handler";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(checkEmployee)
  .use(siasnMiddleware)
  .get(kinerjaPeriodikByNip)
  .post(tambahKinerjaPeridoikByNip);

export default router.handler(apiErrorHandler);
