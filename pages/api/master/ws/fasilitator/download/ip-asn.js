import { getIPAsnReport } from "@/controller/master-fasilitator.controller";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .use(clientCredentialsMiddleware)
  .get(getIPAsnReport);

export default router.handler();
