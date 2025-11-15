import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxyPgProfesi } from "@/controller/siasn/proxy-siasn/proxy-pg-profesi.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxyPgProfesi);

export default router.handler();

