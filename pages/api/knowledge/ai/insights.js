import { createRouter } from "next-connect";
import { getContentAIInsights } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.get(getContentAIInsights);

export default router.handler({});