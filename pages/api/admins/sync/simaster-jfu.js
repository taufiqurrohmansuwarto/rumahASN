import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { syncSimasterJfu } from "@/controller/sync.controller";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";

router
  .use(auth)
  .use(adminMiddleware)
  .use(clientCredentialsMiddleware)
  .put(syncSimasterJfu);

export default router.handler({});