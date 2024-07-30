import { getAllEmployeesMasterPagingAdmin } from "@/controller/master-fasilitator.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnMiddleware)
  .use(clientCredentialsMiddleware)
  .get(getAllEmployeesMasterPagingAdmin);

export default router.handler();
