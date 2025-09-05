import { createRouter } from "next-connect";
import { getAIProcessingStats } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.get(getAIProcessingStats);

export default router.handler({});