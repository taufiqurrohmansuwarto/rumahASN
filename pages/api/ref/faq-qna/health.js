import { healthCheck } from "@/controller/faq-qna.controller";
import { createRouter } from "next-connect";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(healthCheck);

export default router.handler();
