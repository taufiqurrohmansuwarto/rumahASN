import {
  deleteEvent,
  getEvent,
  updateEvent,
} from "@/controller/events.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .get(getEvent)
  .patch(updateEvent)
  .delete(deleteEvent);

export default router.handler();
