import { createRouter } from "next-connect";
import { reprocessContentAI } from "@/controller/knowledge/knowledge-ai.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(reprocessContentAI);

export default router.handler({});
