import { getCVProxyPersonal } from "@/controller/siasn-profile.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import siasnTokenMiddleware from "@/middleware/token-siasn-proxy.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .use(siasnMiddleware)
  .use(siasnTokenMiddleware)
  .get(getCVProxyPersonal);

export default router.handler();
