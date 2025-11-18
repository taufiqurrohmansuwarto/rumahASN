import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxyPangkatQueue } from "@/controller/siasn/proxy-siasn/proxy-pangkat.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

// POST untuk queue-based sync (non-blocking)
router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxyPangkatQueue);

export default router.handler();
