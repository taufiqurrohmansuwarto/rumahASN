import { getAssistantThreads } from "@/controller/chat-ai.controller";
import agentAdminMiddleware from "@/middleware/agent-admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(agentAdminMiddleware).get(getAssistantThreads);

export default router.handler({});