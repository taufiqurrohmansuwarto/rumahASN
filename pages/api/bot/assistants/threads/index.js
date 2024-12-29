import { getAssistantThreads } from "@/controller/chat-ai.controller";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnPemprovMiddleware).get(getAssistantThreads);

export default router.handler({});
