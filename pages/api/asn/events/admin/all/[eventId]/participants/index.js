import {
  createEventParticipants,
  getEventParticipants,
} from "@/controller/event-participants.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventParticipants)
  .post(createEventParticipants);

export default router.handler();
