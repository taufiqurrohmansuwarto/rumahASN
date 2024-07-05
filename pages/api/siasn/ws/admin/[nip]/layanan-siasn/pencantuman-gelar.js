import { usulanPencantumanGelarByNip } from "@/controller/siasn-usulan.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorAsnMiddleware)
  .get(usulanPencantumanGelarByNip);

export default router.handler();
