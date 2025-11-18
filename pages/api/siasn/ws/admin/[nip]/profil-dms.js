import { getDMSProfileController } from "@/controller/siasn/dokumen.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import checkEmployee from "@/middleware/check-employee.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnMiddleware)
  .use(siasnTokenMiddleware)
  .use(checkEmployee)
  .get(getDMSProfileController);

export default router.handler();
