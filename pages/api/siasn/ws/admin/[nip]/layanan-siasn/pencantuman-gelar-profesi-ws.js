import { cekLayananPencantumanGelarProfesiByNip } from "@/controller/siasn/status-layanan.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(siasnMiddleware)
  .use(adminFasilitatorAsnMiddleware)
  .use(checkEmployee)
  .get(cekLayananPencantumanGelarProfesiByNip);

export default router.handler();
