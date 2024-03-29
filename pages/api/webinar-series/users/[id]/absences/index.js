import { getAbsencesUsers } from "@/controller/webinar-series-participants-absence.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(webinarUserTypeMiddleware).get(getAbsencesUsers);

export default router.handler({});
