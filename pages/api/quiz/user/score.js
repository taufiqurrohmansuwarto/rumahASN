import { userScore } from "@/controller/quiz.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(userScore);

export default router.handler();
