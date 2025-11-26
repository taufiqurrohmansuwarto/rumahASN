import { getDataUtamaParuhWaktuByNip } from "@/controller/paruh-waktu.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { apiErrorHandler } from "@/utils/api-handler";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  //   .use(checkEmployee)
  .get(getDataUtamaParuhWaktuByNip);

export default router.handler(apiErrorHandler);
