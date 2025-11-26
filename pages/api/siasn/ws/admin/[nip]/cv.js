import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { createRouter } from "next-connect";
import { getCVProxyByNip } from "@/controller/siasn-profile.controller";

const router = createRouter();

// GET untuk queue-based sync (non-blocking)
router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(siasnTokenMiddleware)
  .get(getCVProxyByNip);

export default router.handler();
