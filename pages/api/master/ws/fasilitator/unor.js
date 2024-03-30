import { getOpd } from "@/controller/master-fasilitator.controller";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(fasilitatorMasterMiddleware)
  .use(siasnMiddleware)
  .use(clientCredentialsMiddleware)
  .get(getOpd);

export default router.handler();
