import { refPangkatSimaster } from "@/controller/simaster/ref-simaster.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .use(clientCredentialsMiddleware)
  .get(refPangkatSimaster);

export default router.handler();
