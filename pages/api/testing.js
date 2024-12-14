import { testChatCompletion } from "@/controller/test-generate.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(testChatCompletion);

export default router.handler();
