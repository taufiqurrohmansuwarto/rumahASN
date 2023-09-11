import { unregisterUserWebinar } from "@/controller/webinar-series.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(webinarUserTypeMiddleware).delete(unregisterUserWebinar);

export default router.handler({});
