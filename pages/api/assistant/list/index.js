import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getAssistants } from "@/controller/chat-ai.controller";
const router = createRouter();

router.use(auth).get(getAssistants);

export default router.handler({});
