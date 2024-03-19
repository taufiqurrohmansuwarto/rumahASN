import { petaJabatanById } from "@/controller/siasn-perencanaan.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(clientCredentialsMiddleware)
  .use(adminFasilitatorMiddleware)
  .get(petaJabatanById);

export default router.handler();
