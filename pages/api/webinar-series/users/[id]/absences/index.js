import {
  registerAbsence,
  userAbsences,
} from "@/controller/webinar-series-participants-absence.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(webinarUserTypeMiddleware)
  .post(registerAbsence)
  .get(userAbsences);

export default router.handler({});
