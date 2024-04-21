import {
  deleteEventMessages,
  getEventMessage,
  updateEventMessages,
} from "@/controller/event-messages.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateEventMessages)
  .delete(deleteEventMessages)
  .get(getEventMessage);

export default router.handler();
