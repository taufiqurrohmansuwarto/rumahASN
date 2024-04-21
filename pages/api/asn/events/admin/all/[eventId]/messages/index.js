import {
  createEventMessages,
  getEventMessages,
} from "@/controller/event-messages.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventMessages)
  .post(createEventMessages);

export default router.handler();
