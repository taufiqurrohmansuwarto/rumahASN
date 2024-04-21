import {
  deleteEventExhibitors,
  getEventExhibitors,
  updateEventExhibitors,
} from "@/controller/event-exhibitors.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateEventExhibitors)
  .delete(deleteEventExhibitors)
  .get(getEventExhibitors);

export default router.handler();
