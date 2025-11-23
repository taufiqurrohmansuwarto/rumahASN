import { updateDataUtamaByNip } from "@/controller/siasn-data-utama.controller";
import { siasnEmployeeDetailByNip } from "@/controller/siasn.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { apiErrorHandler } from "@/utils/api-handler";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .use(checkEmployee)
  .get(siasnEmployeeDetailByNip)
  .post(updateDataUtamaByNip);

export default router.handler(apiErrorHandler);
