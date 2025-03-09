import { getIpAsnByNip } from "@/controller/siasn-pengembangan-kompentensi.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(clientCredentialsMiddleware)
  .use(adminFasilitatorAsnMiddleware)
  .use(checkEmployee)
  .use(siasnMiddleware)
  .get(getIpAsnByNip);

export default router.handler();
