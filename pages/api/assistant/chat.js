import { createRouter } from "next-connect";
const router = createRouter();
import { chatCompletion } from "@/controller/chat-ai.controller";

router.post(chatCompletion);

export default router.handler({});
