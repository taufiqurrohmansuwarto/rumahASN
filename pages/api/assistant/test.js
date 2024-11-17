import { botChat } from "@/controller/ai-assistants.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.post(botChat);

export default router.handler({});
