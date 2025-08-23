import { changeStatusKnowledgeContentAdmin } from "@/controller/knowledge/knowledge-contents-admin.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).patch(changeStatusKnowledgeContentAdmin);

export default router.handler();
