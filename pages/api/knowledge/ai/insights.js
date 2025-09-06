import { createRouter } from "next-connect";
import { getContentAIInsights } from "@/controller/knowledge/knowledge-ai.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getContentAIInsights);

export default router.handler({});