import { createRouter } from "next-connect";
import { getAIProcessingStatus } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.get(getAIProcessingStatus);

export default router.handler({});