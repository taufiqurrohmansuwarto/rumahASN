import { getIpAsn } from "@/controller/siasn-pengembangan-kompentensi.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(clientCredentialsMiddleware)
  .use(asnMiddleware)
  .use(siasnMiddleware)
  .get(getIpAsn);

export default router.handler();
