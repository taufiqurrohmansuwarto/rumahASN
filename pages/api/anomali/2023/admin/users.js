import {
  updateAnomaliByNip,
  userAnomali2022,
} from "@/controller/anomali.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(userAnomali2022)
  .patch(updateAnomaliByNip);

export default router.handler({});
