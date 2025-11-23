import { usulanPencantumanGelarByNipFasilitator } from "@/controller/siasn-usulan.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import checkEmployee from "@/middleware/check-employee.middleware";
import { apiErrorHandler } from "@/utils/api-handler";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .use(checkEmployee)
  .get(usulanPencantumanGelarByNipFasilitator);

export default router.handler(apiErrorHandler);
