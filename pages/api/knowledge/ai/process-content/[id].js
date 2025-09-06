import { createRouter } from "next-connect";
import { processContentAI } from "@/controller/knowledge/knowledge-ai.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(processContentAI);

export default router.handler({});
