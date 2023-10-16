import { userAnswerQuiz } from "@/controller/quiz.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(userAnswerQuiz);

export default router.handler();
