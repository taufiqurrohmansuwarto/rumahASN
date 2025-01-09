import { getRekonJft, postRekonJft } from "@/controller/rekon.controller";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getRekonJft)
  .post(postRekonJft);

export default router.handler();
