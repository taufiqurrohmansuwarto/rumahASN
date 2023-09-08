import {
  getSurvey,
  makeSurvey,
} from "@/controller/webinar-series-surveys.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(webinarUserTypeMiddleware).get(getSurvey).post(makeSurvey);

export default router.handler({});
