import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

import { syncJabatanByNip } from "@/controller/siasn-proxy.controller";

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(checkEmployee)
  .get(syncJabatanByNip);

export default router.handler();
