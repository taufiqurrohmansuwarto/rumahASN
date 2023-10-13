import { leaderBoardQuiz } from "@/controller/quiz.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(leaderBoardQuiz);

export default router.handler();
