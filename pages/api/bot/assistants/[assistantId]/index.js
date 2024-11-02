import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { getAssistants } from "@/controller/chat-ai.controller";

router.use(auth).use(asnMiddleware).get(getAssistants);

export default router.handler({});
