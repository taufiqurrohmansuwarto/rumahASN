import {
  createEventSpeakers,
  getEventSpeakers,
} from "@/controller/event-speakers.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventSpeakers)
  .post(createEventSpeakers);

export default router.handler();
