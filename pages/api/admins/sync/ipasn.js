import { syncIpASN } from "@/controller/sync.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(clientCredentialsMiddleware)
  .use(siasnMiddleware)
  .get(syncIpASN);

export default router.handler({});
