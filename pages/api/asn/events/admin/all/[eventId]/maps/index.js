import {
  createEventMaps,
  getEventMaps,
} from "@/controller/event-maps.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventMaps)
  .post(createEventMaps);

export default router.handler();
