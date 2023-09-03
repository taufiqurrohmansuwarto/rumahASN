import {
  getSurvey,
  makeSurvey,
} from "@/controller/webinar-series-surveys.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(getSurvey).post(makeSurvey);

export default router.handler({});
