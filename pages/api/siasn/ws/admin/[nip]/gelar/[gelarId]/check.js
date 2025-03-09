import { checkGelarByNip } from "@/controller/gelar.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(checkEmployee)
  .get(checkGelarByNip);

export default router.handler();
