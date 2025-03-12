import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { getRwSatyaLencanaByNip } from "@/controller/master.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(checkEmployee)
  .get(getRwSatyaLencanaByNip);

export default router.handler();
