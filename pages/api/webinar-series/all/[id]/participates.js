import {
  registerWebinar,
  unregisterWebinar,
} from "@/controller/webinar-series.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(registerWebinar).delete(unregisterWebinar);

export default router.handler({});
