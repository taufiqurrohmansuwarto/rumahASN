import {
  deleteEventMaps,
  getEventMaps,
  updateEventMaps,
} from "@/controller/event-maps.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateEventMaps)
  .delete(deleteEventMaps)
  .get(getEventMaps);

export default router.handler();
