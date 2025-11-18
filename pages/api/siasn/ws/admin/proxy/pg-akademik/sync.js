import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxyPgAkademikQueue } from "@/controller/siasn/proxy-siasn/proxy-pg-akademik.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

// GET untuk queue-based sync (non-blocking)
router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxyPgAkademikQueue);

export default router.handler();

