import { createRouter } from "next-connect";
import { processContentAI } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(processContentAI);

export default router.handler({});
