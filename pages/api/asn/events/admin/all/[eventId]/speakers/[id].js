import {
  deleteEventSpeakers,
  getEventSpeaker,
  updateEventSpeakers,
} from "@/controller/event-speakers.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventSpeaker)
  .patch(updateEventSpeakers)
  .delete(deleteEventSpeakers);

export default router.handler();
