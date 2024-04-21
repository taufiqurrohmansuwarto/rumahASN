import {
  deleteEventParticipants,
  updateEventParticipants,
} from "@/controller/event-participants.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateEventParticipants)
  .delete(deleteEventParticipants)
  .get(getEventParticipant);

export default router.handler();
