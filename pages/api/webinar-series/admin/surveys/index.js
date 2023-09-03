import {
  createSurveyQuestion,
  surveysQuestions,
} from "@/controller/webinar-series-surveys-questions.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(surveysQuestions)
  .post(createSurveyQuestion);

export default router.handler({});
