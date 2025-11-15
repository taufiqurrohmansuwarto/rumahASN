import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { syncProxySkk } from "@/controller/siasn/proxy-siasn/proxy-skk.controller";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnTokenMiddleware)
  .get(syncProxySkk);

export default router.handler();

