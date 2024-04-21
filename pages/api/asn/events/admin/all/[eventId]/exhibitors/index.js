import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import {
  createEventExhibitors,
  getEventExhibitors,
} from "@/controller/event-exhibitors.controller";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventExhibitors)
  .post(createEventExhibitors);

export default router.handler();
