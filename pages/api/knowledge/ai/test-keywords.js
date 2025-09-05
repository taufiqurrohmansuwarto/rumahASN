import { createRouter } from "next-connect";
import { testKeywordExtraction } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(testKeywordExtraction);

export default router.handler({});
