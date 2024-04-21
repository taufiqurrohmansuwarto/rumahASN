import {
  createEventSponsors,
  getEventSponsors,
} from "@/controller/event-sponsors.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getEventSponsors)
  .post(createEventSponsors);

export default router.handler();
