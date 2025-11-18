import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxyPensiunQueue } from "@/controller/siasn/proxy-siasn/proxy-pensiun.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

// GET untuk queue-based sync (non-blocking)
router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxyPensiunQueue);

export default router.handler();
