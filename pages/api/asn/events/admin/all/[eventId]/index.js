import {
  deleteEvent,
  getEvent,
  updateEvent,
} from "@/controller/events.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEvent)
  .patch(updateEvent)
  .delete(deleteEvent);

export default router.handler();
