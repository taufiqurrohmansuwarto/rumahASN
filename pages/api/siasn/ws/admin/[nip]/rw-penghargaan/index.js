import { tambahPenghargaanByNip } from "@/controller/siasn-penghargaan.controller";
import { getRwPenghargaanByNip } from "@/controller/siasn.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import { apiErrorHandler } from "@/utils/api-handler";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(checkEmployee)
  .use(siasnMiddleware)
  .get(getRwPenghargaanByNip)
  .post(tambahPenghargaanByNip);

export default router.handler(apiErrorHandler);
