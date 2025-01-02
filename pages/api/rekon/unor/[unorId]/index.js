import {
  deleteRekonUnor,
  updateRekonUnor,
} from "@/controller/rekon.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateRekonUnor)
  .delete(deleteRekonUnor);

export default router.handler();
