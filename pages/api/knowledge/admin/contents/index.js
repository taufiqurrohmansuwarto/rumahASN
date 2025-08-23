import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { getKnowledgeContentsAdmin } from "@/controller/knowledge/knowledge-contents-admin.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getKnowledgeContentsAdmin);

export default router.handler();
