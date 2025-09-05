import { createRouter } from "next-connect";
import { testReadabilityScore } from "@/controller/knowledge/knowledge-ai.controller";

const router = createRouter();

router.post(testReadabilityScore);

export default router.handler({});