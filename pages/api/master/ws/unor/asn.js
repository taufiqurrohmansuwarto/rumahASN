import { unorASN } from "@/controller/master.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(clientCredentialsMiddleware)
  .use(asnMiddleware)
  .get(unorASN);


export default router.handler({});