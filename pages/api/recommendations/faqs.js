import { recommendationFaq } from "@/controller/recommendations.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(recommendationFaq);

export default router.handler({});
