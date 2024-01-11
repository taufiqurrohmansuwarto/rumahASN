import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();
import {
  requestTotpConfirmation,
  getLastTotpConfirmation,
  saveTotpConfirmation,
} from "@/controller/esign.controller";

router
  .use(auth)
  .use(adminMiddleware)
  .post(requestTotpConfirmation)
  .patch(saveTotpConfirmation)
  .get(getLastTotpConfirmation);

export default router.handler({});
