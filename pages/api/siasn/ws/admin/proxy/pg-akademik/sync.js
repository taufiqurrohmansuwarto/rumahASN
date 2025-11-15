import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxyPgAkademik } from "@/controller/siasn/proxy-siasn/proxy-pg-akademik.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxyPgAkademik);

export default router.handler();

