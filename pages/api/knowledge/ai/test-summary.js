import { createRouter } from "next-connect";
import { testSummaryGeneration } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(testSummaryGeneration);

export default router.handler({});
