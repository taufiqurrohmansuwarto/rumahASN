import {
  registerWebinar,
  unregisterWebinar,
} from "@/controller/webinar-series.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(webinarUserTypeMiddleware)
  .patch(registerWebinar)
  .delete(unregisterWebinar);

export default router.handler({});
